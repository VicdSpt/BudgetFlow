# Supabase Auth & Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Compte utilisateur optionnel (email/password Supabase) avec synchronisation multi-appareils des données, sans casser le mode invité localStorage.

**Architecture:** AuthProvider (session Supabase) englobe AppProvider. Le dispatch est enrichi : mutation locale immédiate (optimistic) + écriture Supabase si connecté. 4 tables relationnelles avec RLS, mapping camelCase↔snake_case explicite. Hydratation des 4 tables à la connexion, retour au localStorage invité à la déconnexion.

**Tech Stack:** React 19, TypeScript, @supabase/supabase-js, Supabase (Auth + PostgreSQL + RLS)

## Global Constraints

- Spec de référence : `docs/superpowers/specs/2026-07-20-supabase-sync-design.md`
- Le mode invité doit rester intégralement fonctionnel à chaque étape (localStorage, démo, export/import, reset)
- Fichiers types en `.type.ts`, composants PascalCase, hooks `useXxx`, textes UI en français
- Pas de framework de test dans le projet : vérification = `npx tsc -b` + `npx eslint src` + test manuel navigateur à chaque tâche
- Après chaque tâche : `npm run build` doit passer
- Env vars : `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (`.env.local` est déjà couvert par le pattern `*.local` du .gitignore)
- Boutons démo / import JSON / reset : **cachés en mode connecté** (outils du mode invité, spec §7) — l'export reste visible

---

## File Map

| Fichier | Action | Responsabilité |
|---------|--------|----------------|
| `supabase/schema.sql` | Créer | Schéma SQL + RLS (référence, exécuté à la main dans Supabase) |
| `.env.example` | Créer | Documentation des env vars |
| `src/lib/supabase.ts` | Créer | Client Supabase singleton |
| `src/context/AuthContext.tsx` | Créer | Type + createContext + useAuth() |
| `src/context/AuthProvider.tsx` | Créer | Session, signUp/signIn/signOut, onAuthStateChange |
| `src/pages/AuthPage.tsx` | Créer | Écran connexion/inscription |
| `src/lib/mappers.ts` | Créer | Conversions camelCase ↔ snake_case (4 entités) |
| `src/lib/syncToSupabase.ts` | Créer | action → opération Supabase |
| `src/lib/fetchUserData.ts` | Créer | SELECT des 4 tables + mapping |
| `src/main.tsx` | Modifier | AuthProvider autour de AppProvider |
| `src/router/index.tsx` | Modifier | Route /auth |
| `src/components/ui/SideBarMenu.tsx` | Modifier | Lien connexion / email + déconnexion |
| `src/components/ui/MobileNav.tsx` | Modifier | Idem mobile |
| `src/types/common.type.ts` | Modifier | Payloads ADD_* complets |
| `src/features/transactions/types/transaction.type.ts` | Modifier | Payload ADD_TRANSACTION complet |
| `src/context/AppReducer.ts` | Modifier | Reducer purifié (plus de randomUUID) |
| `src/features/goals/hooks/useGoals.ts` | Modifier | Génération id dans le hook |
| `src/features/budget/hooks/useBudget.ts` | Modifier | Génération id dans le hook |
| `src/features/transactions/hooks/useTransaction.ts` | Modifier | Génération id + createdAt dans le hook |
| `src/context/AppProvider.tsx` | Modifier | syncDispatch, hydratation, localStorage conditionnel, migration |
| `src/pages/SettingsPage.tsx` | Modifier | Démo/import cachés si connecté |
| `src/pages/DashboardPage.tsx` | Modifier | Reset/démo cachés si connecté |

---

## Phase 0 — Setup

### Task 1 : Dépendance, client, schéma SQL

**Files:**
- Create: `supabase/schema.sql`
- Create: `.env.example`
- Create: `src/lib/supabase.ts`

**Interfaces:**
- Produces: `supabase` (client exporté depuis `src/lib/supabase.ts`), utilisé par toutes les tâches suivantes

- [ ] **Step 1 : Installer la dépendance**

```bash
npm install @supabase/supabase-js
```

- [ ] **Step 2 : Créer `supabase/schema.sql`**

```sql
-- Schéma BudgetFlow — à exécuter dans le SQL Editor de Supabase
-- (Dashboard Supabase → SQL Editor → New query → coller → Run)

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

-- Row Level Security : chaque utilisateur ne voit que ses lignes
alter table goals enable row level security;
create policy "own rows" on goals for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table fixed_expenses enable row level security;
create policy "own rows" on fixed_expenses for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table monthly_incomes enable row level security;
create policy "own rows" on monthly_incomes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table transactions enable row level security;
create policy "own rows" on transactions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

- [ ] **Step 3 : Créer `.env.example`**

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

- [ ] **Step 4 : Créer `src/lib/supabase.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

- [ ] **Step 5 : Actions manuelles (utilisateur)**

1. Créer un projet sur https://supabase.com (gratuit)
2. SQL Editor → exécuter `supabase/schema.sql`
3. Settings → API → copier `Project URL` et `anon public` key
4. Créer `.env.local` à la racine :
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

- [ ] **Step 6 : Vérifier et committer**

Run: `npx tsc -b && npm run build`
Expected: build OK

```bash
git add package.json package-lock.json supabase/schema.sql .env.example src/lib/supabase.ts
git commit -m "feat: supabase client, schema and env setup"
```

---

## Phase 1 — Authentification

### Task 2 : AuthContext + AuthProvider

**Files:**
- Create: `src/context/AuthContext.tsx`
- Create: `src/context/AuthProvider.tsx`
- Modify: `src/main.tsx`

**Interfaces:**
- Consumes: `supabase` (Task 1)
- Produces: `useAuth(): AuthContextType` — `{ session: Session | null, isAuthLoading: boolean, signUp(email, password): Promise<{ error: string | null }>, signIn(email, password): Promise<{ error: string | null }>, signOut(): Promise<void> }`

- [ ] **Step 1 : Créer `src/context/AuthContext.tsx`**

```typescript
import { createContext, useContext } from "react"
import type { Session } from "@supabase/supabase-js"

export interface AuthContextType {
    session: Session | null
    isAuthLoading: boolean
    signUp: (email: string, password: string) => Promise<{ error: string | null }>
    signIn: (email: string, password: string) => Promise<{ error: string | null }>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

// Ce fichier n'exporte aucun composant (contexte + hook uniquement).
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider")
    }
    return context
}

export default AuthContext
```

- [ ] **Step 2 : Créer `src/context/AuthProvider.tsx`**

```typescript
import { useEffect, useState } from "react"
import type { Session } from "@supabase/supabase-js"
import AuthContext from "./AuthContext"
import { supabase } from "../lib/supabase"

// Traduit les messages d'erreur Supabase les plus courants
function translateAuthError(message: string): string {
    if (message.includes("Invalid login credentials")) return "Email ou mot de passe incorrect."
    if (message.includes("already registered")) return "Un compte existe déjà avec cet email."
    if (message.includes("at least 6 characters")) return "Le mot de passe doit contenir au moins 6 caractères."
    if (message.includes("valid email")) return "Adresse email invalide."
    return "Une erreur est survenue. Réessayez."
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [session, setSession] = useState<Session | null>(null)
    const [isAuthLoading, setIsAuthLoading] = useState(true)

    useEffect(() => {
        // Restaure la session existante au démarrage (supabase-js la stocke lui-même)
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session)
            setIsAuthLoading(false)
        })

        const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
            setSession(newSession)
        })

        return () => listener.subscription.unsubscribe()
    }, [])

    const signUp = async (email: string, password: string) => {
        const { error } = await supabase.auth.signUp({ email, password })
        return { error: error ? translateAuthError(error.message) : null }
    }

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        return { error: error ? translateAuthError(error.message) : null }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
    }

    return (
        <AuthContext.Provider value={{ session, isAuthLoading, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}
```

- [ ] **Step 3 : Modifier `src/main.tsx`**

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppProvider } from './context/AppProvider.tsx'
import { AuthProvider } from './context/AuthProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </AuthProvider>
  </StrictMode>,
)
```

- [ ] **Step 4 : Vérifier et committer**

Run: `npx tsc -b && npx eslint src && npm run dev`
Expected: pas d'erreur, l'app démarre normalement (rien de visible ne change encore)

```bash
git add src/context/AuthContext.tsx src/context/AuthProvider.tsx src/main.tsx
git commit -m "feat: AuthContext and AuthProvider with Supabase session"
```

### Task 3 : Page /auth

**Files:**
- Create: `src/pages/AuthPage.tsx`
- Modify: `src/router/index.tsx`

**Interfaces:**
- Consumes: `useAuth()` (Task 2), `Input`, `Button` (existants)

- [ ] **Step 1 : Créer `src/pages/AuthPage.tsx`**

```typescript
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Input from "../components/ui/Input"
import Button from "../components/ui/Button"

type AuthMode = "signin" | "signup"

export default function AuthPage() {
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const [mode, setMode] = useState<AuthMode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    const action = mode === "signin" ? signIn : signUp
    const { error: authError } = await action(email, password)
    setIsSubmitting(false)
    if (authError) {
      setError(authError)
    } else {
      navigate("/")
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h1 className="text-xl font-semibold text-slate-800 mb-1">
          {mode === "signin" ? "Connexion" : "Créer un compte"}
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          {mode === "signin"
            ? "Retrouvez vos données sur tous vos appareils"
            : "Vos données vous suivront sur tous vos appareils"}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="vous@exemple.fr"
            required
          />
          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="6 caractères minimum"
            minLength={6}
            required
          />

          {error && <p className="text-sm text-rose-500">{error}</p>}

          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "..." : mode === "signin" ? "Se connecter" : "Créer le compte"}
          </Button>
        </form>

        <button
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null) }}
          className="mt-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          {mode === "signin" ? "Pas de compte ? Inscrivez-vous" : "Déjà un compte ? Connectez-vous"}
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2 : Ajouter la route dans `src/router/index.tsx`**

Ajouter l'import et la route :

```typescript
import AuthPage from "../pages/AuthPage";
// ...dans children :
{ path: "auth", element: <AuthPage /> },
```

- [ ] **Step 3 : Test manuel**

`npm run dev` → aller sur `/auth` → créer un compte avec un vrai email → vérifier dans le dashboard Supabase (Authentication → Users) que l'utilisateur apparaît. Tester aussi : mauvais mot de passe → message français.

Note : par défaut Supabase envoie un email de confirmation. Pour simplifier le dev : Dashboard → Authentication → Providers → Email → désactiver "Confirm email".

- [ ] **Step 4 : Commit**

```bash
git add src/pages/AuthPage.tsx src/router/index.tsx
git commit -m "feat: auth page with signin/signup"
```

### Task 4 : Connexion/déconnexion dans la navigation

**Files:**
- Modify: `src/components/ui/SideBarMenu.tsx`
- Modify: `src/components/ui/MobileNav.tsx`

**Interfaces:**
- Consumes: `useAuth()` (Task 2)

- [ ] **Step 1 : SideBarMenu — bloc compte en bas de la sidebar**

Dans `SideBarMenu.tsx`, ajouter les imports :

```typescript
import { LogIn, LogOut } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
```

Dans le composant, récupérer la session : `const { session, signOut } = useAuth()`.

Ajouter juste avant la fermeture du `</nav>` (après la div des navItems) :

```tsx
<div className="px-3 py-4 border-t border-slate-100">
    {session ? (
        <div className="flex items-center justify-between gap-2 px-3">
            <span className="text-xs text-slate-500 truncate" title={session.user.email}>
                {session.user.email}
            </span>
            <button
                onClick={signOut}
                title="Se déconnecter"
                className="text-slate-400 hover:text-rose-500 transition-colors shrink-0"
            >
                <LogOut size={16} />
            </button>
        </div>
    ) : (
        <Link
            to="/auth"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${location.pathname === "/auth"
                ? "bg-emerald-50 text-emerald-700"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            }`}
        >
            <LogIn size={18} />
            Se connecter
        </Link>
    )}
</div>
```

- [ ] **Step 2 : MobileNav — compte dans la top bar**

Dans `MobileNav.tsx`, ajouter les imports :

```typescript
import { Link, useLocation } from "react-router-dom"
import { LogIn, LogOut } from "lucide-react"
import { useAuth } from "../../context/AuthContext"
```

Récupérer `const { session, signOut } = useAuth()` et remplacer le contenu du `<header>` :

```tsx
<header className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between">
    <span className="text-lg font-semibold text-slate-800">BudgetFlow</span>
    {session ? (
        <button onClick={signOut} title="Se déconnecter" className="text-slate-400 hover:text-rose-500">
            <LogOut size={18} />
        </button>
    ) : (
        <Link to="/auth" title="Se connecter" className="text-slate-400 hover:text-emerald-600">
            <LogIn size={18} />
        </Link>
    )}
</header>
```

- [ ] **Step 3 : Test manuel + commit**

Desktop : lien "Se connecter" en bas de sidebar → connexion → email affiché + icône logout. Mobile : icônes dans la top bar.

```bash
git add src/components/ui/SideBarMenu.tsx src/components/ui/MobileNav.tsx
git commit -m "feat: auth entry points in desktop and mobile nav"
```

---

## Phase 2 — Purification du reducer

### Task 5 : Génération des id dans les hooks

**Files:**
- Modify: `src/types/common.type.ts`
- Modify: `src/features/transactions/types/transaction.type.ts`
- Modify: `src/context/AppReducer.ts`
- Modify: `src/features/goals/hooks/useGoals.ts`
- Modify: `src/features/budget/hooks/useBudget.ts`
- Modify: `src/features/transactions/hooks/useTransaction.ts`

**Interfaces:**
- Produces: payloads `ADD_GOAL: Goal`, `ADD_EXPENSE: FixedExpense`, `ADD_TRANSACTION: Transaction` (entités complètes — la couche de sync Task 7 en dépend). Les signatures **publiques** des hooks ne changent pas (les composants ne sont pas touchés).

- [ ] **Step 1 : Types — payloads complets**

Dans `src/types/common.type.ts` :

```typescript
// Avant
| { type: 'ADD_GOAL'; payload: Omit<Goal, 'id'> }
| { type: 'ADD_EXPENSE'; payload: Omit<FixedExpense, 'id'> }
// Après
| { type: 'ADD_GOAL'; payload: Goal }
| { type: 'ADD_EXPENSE'; payload: FixedExpense }
```

Dans `src/features/transactions/types/transaction.type.ts` :

```typescript
// Avant
| { type: 'ADD_TRANSACTION'; payload: Omit<Transaction, 'id' | 'createdAt'> }
// Après
| { type: 'ADD_TRANSACTION'; payload: Transaction }
```

- [ ] **Step 2 : Reducer purifié**

Dans `src/context/AppReducer.ts` :

```typescript
// Avant
case "ADD_GOAL":
    return { ...state, goals: [...state.goals, { ...action.payload, id: crypto.randomUUID() }] }
// Après
case "ADD_GOAL":
    return { ...state, goals: [...state.goals, action.payload] }

// Avant
case "ADD_EXPENSE":
    return { ...state, budget: { ...state.budget, spendingList: [...state.budget.spendingList, { ...action.payload, id: crypto.randomUUID() }] } }
// Après
case "ADD_EXPENSE":
    return { ...state, budget: { ...state.budget, spendingList: [...state.budget.spendingList, action.payload] } }

// Avant
case "ADD_TRANSACTION": {
    const newTransaction: Transaction = {
        ...action.payload,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
    }
    return { ...state, transactions: [...state.transactions, newTransaction] }
}
// Après
case "ADD_TRANSACTION":
    return { ...state, transactions: [...state.transactions, action.payload] }
```

Supprimer l'import `Transaction` devenu inutile dans AppReducer.ts.

- [ ] **Step 3 : Hooks — génération id/createdAt (signatures publiques inchangées)**

`src/features/goals/hooks/useGoals.ts` :

```typescript
const addGoal = (goal: Omit<Goal, "id">) => {
    dispatch({ type: "ADD_GOAL", payload: { ...goal, id: crypto.randomUUID() } });
}
```

`src/features/budget/hooks/useBudget.ts` :

```typescript
const addExpense = (expense: Omit<FixedExpense, "id">) => {
    dispatch({ type: "ADD_EXPENSE", payload: { ...expense, id: crypto.randomUUID() } });
};
```

`src/features/transactions/hooks/useTransaction.ts` :

```typescript
const add = (payload: Omit<Transaction, 'id' | 'createdAt'>) => {
    dispatch({
        type: 'ADD_TRANSACTION',
        payload: { ...payload, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
    })
}
```

- [ ] **Step 4 : Vérifier et committer**

Run: `npx tsc -b && npx eslint src`
Test manuel : ajouter un objectif, une dépense fixe, une transaction → tout fonctionne comme avant.

```bash
git add src/types/common.type.ts src/features/transactions/types/transaction.type.ts src/context/AppReducer.ts src/features/goals/hooks/useGoals.ts src/features/budget/hooks/useBudget.ts src/features/transactions/hooks/useTransaction.ts
git commit -m "refactor: pure reducer - id generation moved to hooks"
```

---

## Phase 3 — Synchronisation

### Task 6 : Mappers camelCase ↔ snake_case

**Files:**
- Create: `src/lib/mappers.ts`

**Interfaces:**
- Produces: `goalToRow(goal, userId)`, `rowToGoal(row)`, `expenseToRow(expense, userId)`, `rowToExpense(row)`, `transactionToRow(t, userId)`, `rowToTransaction(row)`, `incomeToRow(income, userId)`, `rowToIncome(row)` — consommés par Tasks 7 et 8

- [ ] **Step 1 : Créer `src/lib/mappers.ts`**

```typescript
import type { Goal } from "../features/goals/types/goal.type"
import type { FixedExpense, MonthlyIncome } from "../features/budget/types/budget.type"
import type { Transaction } from "../features/transactions/types/transaction.type"

// ---- Goals ----
export interface GoalRow {
  id: string
  user_id: string
  name: string
  description: string
  target_savings: number
  current_savings: number
  deadline_date: string | null
  status: string
}

export function goalToRow(goal: Goal, userId: string): GoalRow {
  return {
    id: goal.id,
    user_id: userId,
    name: goal.name,
    description: goal.description,
    target_savings: goal.targetSavings,
    current_savings: goal.currentSavings,
    deadline_date: goal.deadlineDate || null,
    status: goal.status,
  }
}

export function rowToGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    targetSavings: row.target_savings,
    currentSavings: row.current_savings,
    deadlineDate: row.deadline_date ?? undefined,
    status: row.status as Goal["status"],
  }
}

// ---- Fixed expenses ----
export interface ExpenseRow {
  id: string
  user_id: string
  name: string
  amount: number
  frequency: string
  category: string
  payment_day: number | null
}

export function expenseToRow(expense: FixedExpense, userId: string): ExpenseRow {
  return {
    id: expense.id,
    user_id: userId,
    name: expense.name,
    amount: expense.amount,
    frequency: expense.frequency,
    category: expense.category,
    payment_day: expense.paymentDay ?? null,
  }
}

export function rowToExpense(row: ExpenseRow): FixedExpense {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount,
    frequency: row.frequency as FixedExpense["frequency"],
    category: row.category as FixedExpense["category"],
    paymentDay: row.payment_day ?? undefined,
  }
}

// ---- Monthly incomes ----
export interface IncomeRow {
  user_id: string
  month: string
  income: number
}

export function incomeToRow(income: MonthlyIncome, userId: string): IncomeRow {
  return { user_id: userId, month: income.month, income: income.income }
}

export function rowToIncome(row: IncomeRow): MonthlyIncome {
  return { month: row.month, income: row.income }
}

// ---- Transactions ----
export interface TransactionRow {
  id: string
  user_id: string
  amount: number
  category: string
  description: string
  date: string
  tag: string
  created_at: string
}

export function transactionToRow(t: Transaction, userId: string): TransactionRow {
  return {
    id: t.id,
    user_id: userId,
    amount: t.amount,
    category: t.category,
    description: t.description,
    date: t.date,
    tag: t.tag,
    created_at: t.createdAt,
  }
}

export function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    amount: row.amount,
    category: row.category as Transaction["category"],
    description: row.description,
    date: row.date,
    tag: row.tag as Transaction["tag"],
    createdAt: row.created_at,
  }
}
```

- [ ] **Step 2 : Vérifier et committer**

Run: `npx tsc -b`

```bash
git add src/lib/mappers.ts
git commit -m "feat: camelCase/snake_case mappers for supabase rows"
```

### Task 7 : syncToSupabase + dispatch enrichi

**Files:**
- Create: `src/lib/syncToSupabase.ts`
- Modify: `src/context/AppProvider.tsx`

**Interfaces:**
- Consumes: mappers (Task 6), `supabase` (Task 1), `useAuth()` (Task 2)
- Produces: `syncToSupabase(action: AppAction, userId: string): void` ; le `dispatch` exposé par AppContext devient le dispatch enrichi (signature identique pour les consommateurs)

- [ ] **Step 1 : Créer `src/lib/syncToSupabase.ts`**

```typescript
import { supabase } from "./supabase"
import { goalToRow, expenseToRow, incomeToRow, transactionToRow } from "./mappers"
import type { AppAction } from "../types/common.type"

// Reflète chaque action mutation vers Supabase (fire-and-forget, optimistic UI).
// v1 : pas de rollback en cas d'échec — on log et on notifie.
export function syncToSupabase(action: AppAction, userId: string): void {
  const report = (op: string) => (result: { error: { message: string } | null }) => {
    if (result.error) {
      console.error(`[sync] ${op} a échoué :`, result.error.message)
    }
  }

  switch (action.type) {
    case "ADD_GOAL":
      supabase.from("goals").insert(goalToRow(action.payload, userId)).then(report("ADD_GOAL"))
      break
    case "UPDATE_GOAL":
      supabase.from("goals").update(goalToRow(action.payload, userId)).eq("id", action.payload.id).then(report("UPDATE_GOAL"))
      break
    case "DELETE_GOAL":
      supabase.from("goals").delete().eq("id", action.payload).then(report("DELETE_GOAL"))
      break

    case "ADD_EXPENSE":
      supabase.from("fixed_expenses").insert(expenseToRow(action.payload, userId)).then(report("ADD_EXPENSE"))
      break
    case "UPDATE_EXPENSE":
      supabase.from("fixed_expenses").update(expenseToRow(action.payload, userId)).eq("id", action.payload.id).then(report("UPDATE_EXPENSE"))
      break
    case "DELETE_EXPENSE":
      supabase.from("fixed_expenses").delete().eq("id", action.payload).then(report("DELETE_EXPENSE"))
      break

    case "SET_MONTHLY_INCOME":
      supabase.from("monthly_incomes").upsert(incomeToRow(action.payload, userId)).then(report("SET_MONTHLY_INCOME"))
      break
    case "RESET_INCOME":
      supabase.from("monthly_incomes").delete().eq("user_id", userId).then(report("RESET_INCOME"))
      break
    case "RESET_EXPENSES":
      supabase.from("fixed_expenses").delete().eq("user_id", userId).then(report("RESET_EXPENSES"))
      break

    case "ADD_TRANSACTION":
      supabase.from("transactions").insert(transactionToRow(action.payload, userId)).then(report("ADD_TRANSACTION"))
      break
    case "UPDATE_TRANSACTION":
      supabase.from("transactions").update(transactionToRow(action.payload, userId)).eq("id", action.payload.id).then(report("UPDATE_TRANSACTION"))
      break
    case "DELETE_TRANSACTION":
      supabase.from("transactions").delete().eq("id", action.payload).then(report("DELETE_TRANSACTION"))
      break

    // HYDRATE_* : flux entrant uniquement, jamais synchronisé vers le cloud
    default:
      break
  }
}
```

- [ ] **Step 2 : Dispatch enrichi dans `src/context/AppProvider.tsx`**

Remplacer le contenu du fichier :

```typescript
import { useReducer, useEffect, useCallback } from "react"
import AppContext from "./AppContext"
import { appReducer } from "./AppReducer"
import { useAuth } from "./AuthContext"
import { syncToSupabase } from "../lib/syncToSupabase"
import type { AppState, AppAction } from "../types/common.type"

const emptyBudget = { monthlyIncomes: [], spendingList: [] }

const getGuestState = (): AppState => {
  try {
    const savedGoals = localStorage.getItem("budgetflow_goals")
    const savedBudget = localStorage.getItem("budgetflow_budget")
    const savedTransactions = localStorage.getItem("budgetflow_transactions")
    return {
      goals: savedGoals ? JSON.parse(savedGoals) : [],
      budget: savedBudget ? JSON.parse(savedBudget) : emptyBudget,
      transactions: savedTransactions ? JSON.parse(savedTransactions) : [],
    }
  } catch {
    return { goals: [], budget: emptyBudget, transactions: [] }
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
    const { session } = useAuth()
    const [state, dispatch] = useReducer(appReducer, getGuestState())

    // Dispatch enrichi : mutation locale immédiate + écriture cloud si connecté
    const syncDispatch = useCallback((action: AppAction) => {
        dispatch(action)
        if (session) syncToSupabase(action, session.user.id)
    }, [session])

    // localStorage : uniquement en mode invité (connecté, la vérité est dans Supabase)
    useEffect(() => {
        if (session) return
        localStorage.setItem("budgetflow_goals", JSON.stringify(state.goals))
        localStorage.setItem("budgetflow_budget", JSON.stringify(state.budget))
        localStorage.setItem("budgetflow_transactions", JSON.stringify(state.transactions))
    }, [state, session])

    return (
        <AppContext.Provider value={{ state, dispatch: syncDispatch }}>
            {children}
        </AppContext.Provider>
    )
}
```

- [ ] **Step 3 : Test manuel + commit**

Connecté : ajouter un objectif → vérifier dans Supabase (Table Editor → goals) que la ligne apparaît. Modifier, supprimer → la table suit. Mode invité : tout fonctionne comme avant (localStorage).

```bash
git add src/lib/syncToSupabase.ts src/context/AppProvider.tsx
git commit -m "feat: sync dispatch mirrors mutations to supabase when logged in"
```

### Task 8 : Hydratation à la connexion / retour invité

**Files:**
- Create: `src/lib/fetchUserData.ts`
- Modify: `src/context/AppProvider.tsx`

**Interfaces:**
- Consumes: mappers (Task 6), `supabase` (Task 1)
- Produces: `fetchUserData(): Promise<AppState>` (les SELECT sont filtrés par RLS, pas besoin de userId)

- [ ] **Step 1 : Créer `src/lib/fetchUserData.ts`**

```typescript
import { supabase } from "./supabase"
import { rowToGoal, rowToExpense, rowToIncome, rowToTransaction } from "./mappers"
import type { GoalRow, ExpenseRow, IncomeRow, TransactionRow } from "./mappers"
import type { AppState } from "../types/common.type"

// Charge toutes les données du compte (RLS filtre automatiquement par user_id)
export async function fetchUserData(): Promise<AppState> {
  const [goalsRes, expensesRes, incomesRes, transactionsRes] = await Promise.all([
    supabase.from("goals").select("*"),
    supabase.from("fixed_expenses").select("*"),
    supabase.from("monthly_incomes").select("*"),
    supabase.from("transactions").select("*"),
  ])

  const firstError = goalsRes.error ?? expensesRes.error ?? incomesRes.error ?? transactionsRes.error
  if (firstError) throw new Error(firstError.message)

  return {
    goals: ((goalsRes.data ?? []) as GoalRow[]).map(rowToGoal),
    budget: {
      spendingList: ((expensesRes.data ?? []) as ExpenseRow[]).map(rowToExpense),
      monthlyIncomes: ((incomesRes.data ?? []) as IncomeRow[]).map(rowToIncome),
    },
    transactions: ((transactionsRes.data ?? []) as TransactionRow[]).map(rowToTransaction),
  }
}
```

- [ ] **Step 2 : Hydratation dans `AppProvider`**

Ajouter dans `AppProvider` (après le useEffect localStorage) :

```typescript
// Hydratation : connexion → données du compte ; déconnexion → retour aux données invité
useEffect(() => {
    let cancelled = false

    const hydrate = (data: AppState) => {
        if (cancelled) return
        dispatch({ type: "HYDRATE_GOALS", payload: data.goals })
        dispatch({ type: "HYDRATE_BUDGET", payload: data.budget })
        dispatch({ type: "HYDRATE_TRANSACTIONS", payload: data.transactions })
    }

    if (session) {
        fetchUserData()
            .then(hydrate)
            .catch(err => console.error("[sync] chargement du compte échoué :", err))
    } else {
        hydrate(getGuestState())
    }

    return () => { cancelled = true }
}, [session])
```

Ajouter l'import : `import { fetchUserData } from "../lib/fetchUserData"`.

**Piège à vérifier** : le useEffect localStorage ne doit PAS écraser les données invité pendant qu'on est connecté — c'est déjà géré par le `if (session) return`. Mais à la déconnexion, l'ordre des effets compte : l'hydratation invité recharge le localStorage AVANT que l'effet d'écriture ne se redéclenche (même render → l'effet d'écriture voit déjà le state invité restauré au render suivant).

- [ ] **Step 2b : Indicateur de synchronisation (spec §4)**

Dans `src/context/AppContext.tsx`, étendre le type :

```typescript
interface AppContextType {
    state: AppState;
    dispatch: React.Dispatch<AppAction>;
    isSyncLoading: boolean;
}
```

Dans `AppProvider` : `const [isSyncLoading, setIsSyncLoading] = useState(false)` — passer à `true` avant `fetchUserData()`, à `false` dans un `.finally()`. L'exposer dans la value du Provider.

Dans `SideBarMenu.tsx`, sous le bloc compte (quand connecté) :

```tsx
{isSyncLoading && <p className="text-xs text-slate-400 px-3 mt-1">Synchronisation…</p>}
```

(récupéré via `const { isSyncLoading } = useAppContext()`)

- [ ] **Step 3 : Test manuel + commit**

1. Connecté sur desktop : ajouter des données → déconnexion → les données invité (autres) réapparaissent → reconnexion → les données du compte reviennent
2. Ouvrir l'app dans un autre navigateur (simule le mobile) → se connecter → les mêmes données apparaissent : **la sync multi-appareils fonctionne**

```bash
git add src/lib/fetchUserData.ts src/context/AppProvider.tsx
git commit -m "feat: hydrate account data on login, restore guest data on logout"
```

### Task 9 : Migration des données invité + outils invité cachés

**Files:**
- Modify: `src/context/AppProvider.tsx`
- Modify: `src/pages/SettingsPage.tsx`
- Modify: `src/pages/DashboardPage.tsx`

**Interfaces:**
- Consumes: `fetchUserData` (Task 8), mappers (Task 6), `ConfirmDialog` (existant)

- [ ] **Step 1 : Prompt de migration dans `AppProvider`**

Modifier le useEffect d'hydratation : après le fetch réussi, détecter le cas migration.

```typescript
import { useReducer, useEffect, useState, useCallback } from "react"
import ConfirmDialog from "../components/ui/ConfirmDialog"
import { goalToRow, expenseToRow, incomeToRow, transactionToRow } from "../lib/mappers"
import { supabase } from "../lib/supabase"
```

Ajouter l'état : `const [showMigrationPrompt, setShowMigrationPrompt] = useState(false)`

Dans le `.then(...)` du fetch de l'effet d'hydratation, remplacer `hydrate` par :

```typescript
fetchUserData()
    .then(data => {
        const accountIsEmpty =
            data.goals.length === 0 &&
            data.transactions.length === 0 &&
            data.budget.monthlyIncomes.length === 0 &&
            data.budget.spendingList.length === 0
        const guest = getGuestState()
        const guestHasData =
            guest.goals.length > 0 ||
            guest.transactions.length > 0 ||
            guest.budget.monthlyIncomes.length > 0 ||
            guest.budget.spendingList.length > 0

        hydrate(data)
        if (accountIsEmpty && guestHasData) setShowMigrationPrompt(true)
    })
    .catch(err => console.error("[sync] chargement du compte échoué :", err))
```

Ajouter les handlers :

```typescript
const clearGuestStorage = () => {
    localStorage.removeItem("budgetflow_goals")
    localStorage.removeItem("budgetflow_budget")
    localStorage.removeItem("budgetflow_transactions")
}

const acceptMigration = async () => {
    if (!session) return
    const guest = getGuestState()
    const userId = session.user.id
    await Promise.all([
        guest.goals.length > 0 && supabase.from("goals").insert(guest.goals.map(g => goalToRow(g, userId))),
        guest.budget.spendingList.length > 0 && supabase.from("fixed_expenses").insert(guest.budget.spendingList.map(e => expenseToRow(e, userId))),
        guest.budget.monthlyIncomes.length > 0 && supabase.from("monthly_incomes").insert(guest.budget.monthlyIncomes.map(i => incomeToRow(i, userId))),
        guest.transactions.length > 0 && supabase.from("transactions").insert(guest.transactions.map(t => transactionToRow(t, userId))),
    ])
    clearGuestStorage()
    dispatch({ type: "HYDRATE_GOALS", payload: guest.goals })
    dispatch({ type: "HYDRATE_BUDGET", payload: guest.budget })
    dispatch({ type: "HYDRATE_TRANSACTIONS", payload: guest.transactions })
    setShowMigrationPrompt(false)
}
```

Et dans le JSX du Provider :

```tsx
return (
    <AppContext.Provider value={{ state, dispatch: syncDispatch }}>
        {children}
        <ConfirmDialog
            isOpen={showMigrationPrompt}
            title="Importer vos données locales ?"
            message="Votre compte est vide mais cet appareil contient des données (objectifs, budget, dépenses). Voulez-vous les importer dans votre compte ?"
            confirmLabel="Importer"
            onConfirm={acceptMigration}
            onCancel={() => setShowMigrationPrompt(false)}
        />
    </AppContext.Provider>
)
```

- [ ] **Step 2 : Cacher les outils invité quand connecté**

`src/pages/SettingsPage.tsx` — entourer la carte "Données de démonstration" et le bouton "Importer JSON" :

```typescript
import { useAuth } from "../context/AuthContext"
// dans le composant :
const { session } = useAuth()
```

```tsx
{/* Import : outil invité uniquement (connecté, la sauvegarde c'est le cloud) */}
{!session && (
    <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>Importer JSON</Button>
)}
```

```tsx
{!session && (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        {/* ...carte démo inchangée... */}
    </div>
)}
```

`src/pages/DashboardPage.tsx` — même logique pour le bouton Réinitialiser et la bannière démo :

```typescript
import { useAuth } from "../context/AuthContext"
// dans le composant :
const { session } = useAuth()
```

```tsx
{!isAppEmpty && !session && (
    <Button variant="secondary" onClick={() => setIsResetConfirmOpen(true)}>...</Button>
)}
{isAppEmpty && !session && (
    <div className="bg-emerald-50 ...">...</div>
)}
```

- [ ] **Step 3 : Test manuel + commit**

1. Mode invité : créer 2 objectifs → créer un compte neuf → prompt de migration → Importer → les objectifs sont dans Supabase (Table Editor) et le localStorage invité est vide
2. Refuser la migration sur un autre jeu de données → le compte vide fait foi, les données invité réapparaissent à la déconnexion
3. Connecté : boutons démo/import/reset invisibles

```bash
git add src/context/AppProvider.tsx src/pages/SettingsPage.tsx src/pages/DashboardPage.tsx
git commit -m "feat: guest data migration prompt + guest-only tools hidden when logged in"
```

---

## Phase 4 — Déploiement

### Task 10 : Vercel + vérification finale

- [ ] **Step 1 : Env vars Vercel (manuel)**

Vercel Dashboard → projet BudgetFlow → Settings → Environment Variables → ajouter `VITE_SUPABASE_URL` et `VITE_SUPABASE_ANON_KEY` (mêmes valeurs que `.env.local`) → redéployer.

- [ ] **Step 2 : Vérification complète**

Run: `npm run build && npx eslint src`
Expected: build OK, lint clean

Checklist navigateur (sur le site déployé) :
1. Mode invité intact : démo, reset, export/import, CRUD complet
2. Inscription → connexion → ajout de données → visible dans Supabase
3. Connexion depuis un 2ème appareil/navigateur → mêmes données
4. Déconnexion → retour aux données invité de l'appareil
5. Migration : données invité + compte neuf → prompt → import OK

- [ ] **Step 3 : Commit final et push**

```bash
git add -A
git commit -m "feat: supabase auth and multi-device sync complete"
git push
```
