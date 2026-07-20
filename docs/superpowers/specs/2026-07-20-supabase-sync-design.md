# BudgetFlow — Supabase Auth & Sync Design Spec
**Date:** 2026-07-20
**Stack ajouté:** Supabase (auth email/password + PostgreSQL + RLS)
**Objectif:** Synchronisation multi-appareils des données via un compte optionnel, sans casser le mode invité

---

## 1. Contexte & Objectifs

BudgetFlow persiste actuellement via localStorage : les données restent sur un seul appareil. Cette feature ajoute un **compte utilisateur optionnel** (email + mot de passe via Supabase) qui synchronise les données dans le cloud.

**Décisions actées :**
- **Auth :** email + mot de passe (Supabase Auth). Pas d'OAuth en v1.
- **Mode :** invité + compte optionnel. Sans compte, l'app fonctionne exactement comme aujourd'hui (localStorage, démo, export/import). Connecté, les données vivent dans Supabase et suivent l'utilisateur.
- **Stockage :** tables relationnelles (4 tables + RLS), PAS de blob JSON. Les actions du reducer correspondent 1:1 aux opérations SQL.

**Objectifs pédagogiques :** modélisation de schéma SQL, Row Level Security, auth flow, optimistic updates, mapping camelCase↔snake_case — le socle des entretiens full stack.

---

## 2. Schéma de base de données

Quatre tables en `snake_case`, exécutées dans le SQL Editor de Supabase :

```sql
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text not null default '',
  target_savings numeric not null,
  current_savings numeric not null default 0,
  deadline_date date,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table fixed_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  amount numeric not null,
  frequency text not null,
  category text not null,
  payment_day int
);

create table monthly_incomes (
  user_id uuid not null references auth.users(id) on delete cascade,
  month text not null,
  income numeric not null,
  primary key (user_id, month)
);

create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric not null,
  category text not null,
  description text not null,
  date date not null,
  tag text not null,
  created_at timestamptz not null default now()
);
```

**RLS sur chaque table** (exemple pour `goals`, à répliquer sur les 4) :

```sql
alter table goals enable row level security;
create policy "own rows" on goals for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

**Points de conception :**
- `user_id` + `on delete cascade` partout : suppression de compte = suppression des données
- RLS = la sécurité est dans la base ; la clé `anon` publique ne donne accès qu'à ses propres lignes
- `monthly_incomes` : PK composée `(user_id, month)` → un revenu par mois garanti par la base, `SET_MONTHLY_INCOME` devient un `upsert`

---

## 3. Authentification

### Client Supabase — `src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

### AuthContext — `src/context/AuthContext.tsx` + `AuthProvider.tsx`

Même pattern que AppContext. Expose via `useAuth()` :

```typescript
interface AuthContextType {
  session: Session | null      // null = mode invité
  isAuthLoading: boolean       // true pendant la restauration de session au démarrage
  signUp: (email: string, password: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}
```

`AuthProvider` écoute `supabase.auth.onAuthStateChange()` ; la session survit au rechargement (gérée par supabase-js) et se rafraîchit seule.

### Page `/auth` — `src/pages/AuthPage.tsx`

Un écran, bascule interne connexion ↔ inscription (state local `mode`). Champs email + password (min 6 caractères, la limite Supabase par défaut). Erreurs Supabase traduites en français. Après connexion réussie → redirect vers `/`.

### Navigation

Nouvel item dans `navItems` impossible (nécessite session) → géré à part dans `SideBarMenu` et `MobileNav` :
- Invité → lien "Se connecter" (icône `LogIn`) vers `/auth`
- Connecté → email affiché (tronqué) + bouton déconnexion (icône `LogOut`)

### Hiérarchie des providers — `main.tsx`

```tsx
<AuthProvider>
  <AppProvider>   {/* consulte la session pour choisir sa stratégie de persistance */}
    <App />
  </AppProvider>
</AuthProvider>
```

---

## 4. Couche de synchronisation

### Purification du reducer (préalable)

`crypto.randomUUID()` et `new Date().toISOString()` sortent du reducer (un reducer doit être pur ; la sync a besoin de l'id avant le dispatch). Les payloads `ADD_*` portent désormais l'entité **complète** :

```typescript
// Avant : { type: 'ADD_GOAL'; payload: Omit<Goal, 'id'> }   → reducer génère l'id
// Après : { type: 'ADD_GOAL'; payload: Goal }               → hook génère l'id
```

Fichiers touchés : `common.type.ts`, `transaction.type.ts` (types d'actions), `AppReducer.ts` (cases simplifiés), `useGoals.ts` / `useBudget.ts` / `useTransaction.ts` (génération id + createdAt).

### Dispatch enrichi — dans `AppProvider`

```typescript
const syncDispatch = (action: AppAction) => {
  dispatch(action)                        // 1. optimistic : l'UI réagit immédiatement
  if (session) syncToSupabase(action)     // 2. écriture cloud en arrière-plan
}
```

`syncToSupabase(action)` — `src/lib/syncToSupabase.ts` — switch sur `action.type` :

| Action | Opération Supabase |
|--------|--------------------|
| `ADD_GOAL` / `ADD_TRANSACTION` / `ADD_EXPENSE` | `.insert(toRow(payload))` |
| `UPDATE_GOAL` / `UPDATE_TRANSACTION` / `UPDATE_EXPENSE` | `.update(...).eq('id', payload.id)` |
| `DELETE_GOAL` / `DELETE_TRANSACTION` / `DELETE_EXPENSE` | `.delete().eq('id', payload)` |
| `SET_MONTHLY_INCOME` | `.upsert(...)` |
| `RESET_INCOME` / `RESET_EXPENSES` | `.delete().eq('user_id', ...)` |
| `HYDRATE_*` | ignoré (flux entrant, pas sortant ; la migration §5 fait ses inserts directement, sans passer par syncDispatch) |

Échec d'écriture → `console.error` + message utilisateur simple. **Pas de rollback ni de retry en v1** (limite assumée et documentée).

### Mapping — `src/lib/mappers.ts`

Paires typées par entité : `goalToRow`/`rowToGoal`, `expenseToRow`/`rowToExpense`, `transactionToRow`/`rowToTransaction`, `incomeToRow`/`rowToIncome`. Conversion camelCase ↔ snake_case explicite champ par champ.

### Hydratation à la connexion

Dans `AppProvider`, un `useEffect` sur la session :

```
session devient non-null
  → isSyncLoading = true
  → SELECT parallèles sur les 4 tables (filtrés par RLS automatiquement)
  → dispatch HYDRATE_GOALS / HYDRATE_BUDGET / HYDRATE_TRANSACTIONS
  → isSyncLoading = false
```

Pendant `isSyncLoading` : indicateur discret (pas d'écran bloquant).
À la déconnexion : re-lecture du localStorage invité (retour au mode invité).

### Persistance locale

Le `useEffect` localStorage actuel devient **conditionnel** : il n'écrit que si `session === null`. Connecté, la source de vérité est Supabase — on n'écrit pas les données du compte dans le localStorage de l'appareil.

---

## 5. Migration des données invité

À la connexion, si **le compte est vide** (les 4 SELECT ne renvoient rien) **et** que le localStorage invité contient des données :

- `ConfirmDialog` : *"Importer vos données locales vers votre compte ?"*
- **Accepté** → bulk insert des données locales (avec `user_id`), puis nettoyage du localStorage invité, puis hydratation normale
- **Refusé** → le compte (vide) fait foi ; le localStorage invité est conservé pour le mode invité

Si le compte contient déjà des données → pas de prompt, les données du compte s'affichent (pas de merge en v1).

---

## 6. Configuration & déploiement

- `.env.local` (gitignoré) : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- `.env.example` commité avec les clés vides
- Les mêmes variables dans les settings Vercel
- Dépendance : `@supabase/supabase-js`

**Actions manuelles utilisateur (hors code) :**
1. Créer le projet sur supabase.com
2. Exécuter le SQL du §2 dans le SQL Editor
3. Récupérer URL + clé anon (Settings → API)
4. Renseigner `.env.local` et les env vars Vercel

---

## 7. Ce qui ne change pas

Mode invité intégral : données de démo, reset, export/import JSON, toute l'UX actuelle sans compte. L'export/import JSON reste un outil du mode invité (connecté, la sauvegarde c'est le cloud).

---

## 8. Limites assumées (v1)

- Pas de rollback des optimistic updates en cas d'échec réseau (message d'erreur seulement)
- Pas de mode offline connecté (pas de queue de sync)
- Pas de merge invité + compte existant (le compte fait foi)
- Pas de temps réel multi-onglets (pas de Supabase Realtime)
- Pas de "mot de passe oublié" en v1 (ajout facile plus tard via `resetPasswordForEmail`)
