# BudgetFlow — Design Spec
**Date:** 2026-03-21
**Stack:** React 19 + TypeScript + Vite + TailwindCSS + react-router-dom + recharts
**Objectif:** App de gestion d'épargne personnelle, vitrine technique pour interviews React/TS

---

## 1. Contexte & Objectifs

BudgetFlow est une application personnelle de gestion de budget et d'objectifs d'épargne. Elle permet à l'utilisateur de :
- Définir des objectifs d'épargne (ex: moto, voyage, PC) avec prix cible, date limite et mensualité
- Gérer un budget mensuel global (revenus - dépenses fixes = disponible)
- Visualiser la progression de chaque objectif et le budget restant à allouer
- Persister les données en local (localStorage + export/import JSON)

Le projet est conçu pour couvrir un maximum de concepts React/TypeScript afin de servir de vitrine technique en entretien.

---

## 2. Architecture

### Structure de fichiers

```
src/
  features/
    goals/
      components/   GoalCard.tsx, GoalForm.tsx, GoalList.tsx
      hooks/        useGoals.ts
      types/        goal.types.ts
      utils/        goalCalculations.ts   ← monthsToGoal, percentComplete
    budget/
      components/   BudgetForm.tsx, BudgetSummary.tsx
      hooks/        useBudget.ts
      types/        budget.types.ts
    dashboard/
      components/   SavingsChart.tsx, GlobalProgress.tsx
      (pas de hooks/types propres — consomme uniquement le context global)
  context/
      AppContext.tsx    ← définit le type AppContextType, createContext, useAppContext()
      AppReducer.ts     ← fonction pure (state, action) => state + type AppAction
      AppProvider.tsx   ← useReducer, useEffect sync localStorage, expose le context
  hooks/
      useLocalStorage.ts   ← custom hook générique useLocalStorage<T>
  pages/
      DashboardPage.tsx
      GoalsPage.tsx
      BudgetPage.tsx
      SettingsPage.tsx
  components/
      ui/   Button.tsx, Modal.tsx, Input.tsx, ProgressBar.tsx
  router/
      index.tsx
  types/
      common.types.ts   ← StorageKey, ID utilities, types partagés entre features
```

### Responsabilités des fichiers context/

| Fichier | Responsabilité |
|---------|----------------|
| `AppContext.tsx` | Définit `AppContextType`, `AppState`, `createContext<AppContextType \| null>`, et exporte `useAppContext()` avec guard null |
| `AppReducer.ts` | Fonction pure `appReducer(state, action) => state` + type `AppAction = GoalAction \| BudgetAction` |
| `AppProvider.tsx` | Appelle `useReducer(appReducer, initialState)`, `useEffect` pour sync localStorage, wrap les enfants avec le Provider |

### Principe de séparation
- Chaque feature est autonome : composants, hooks, types dans son propre dossier
- Le context global est le seul point de partage entre features
- Les composants UI partagés vivent dans `components/ui/`
- `dashboard/` n'a pas de hooks/types propres car il consomme uniquement le context global

---

## 3. Types TypeScript

### Convention `type` vs `interface`
- **`interface`** : pour les formes d'objets (entités, props de composants)
- **`type`** : pour les unions, aliases, discriminated unions, types génériques

### Types Goals

```typescript
// goal.types.ts
interface Goal {
  id: string                    // généré via crypto.randomUUID()
  name: string
  targetAmount: number
  currentAmount: number
  monthlyContribution: number
  targetDate: string            // ISO date string (YYYY-MM-DD)
  category: GoalCategory
  color: string
  createdAt: string             // ISO date string
}

type GoalCategory = 'vehicle' | 'travel' | 'tech' | 'housing' | 'other'

type GoalAction =
  | { type: 'ADD_GOAL'; payload: Omit<Goal, 'id' | 'createdAt'> }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'ADD_CONTRIBUTION'; payload: { goalId: string; amount: number } }
```

### Types Budget

```typescript
// budget.types.ts
interface Budget {
  monthlyIncome: number
  fixedExpenses: FixedExpense[]
}

interface FixedExpense {
  id: string        // généré via crypto.randomUUID()
  label: string
  amount: number
}

type BudgetAction =
  | { type: 'SET_INCOME'; payload: number }
  | { type: 'ADD_EXPENSE'; payload: Omit<FixedExpense, 'id'> }
  | { type: 'UPDATE_EXPENSE'; payload: FixedExpense }
  | { type: 'DELETE_EXPENSE'; payload: string }
```

### Types communs

```typescript
// common.types.ts
type StorageKey = 'budgetflow_goals' | 'budgetflow_budget'

// Union de toutes les actions — utilisée dans AppReducer.ts
type AppAction = GoalAction | BudgetAction
```

---

## 4. State Management

### Pattern : Context + useReducer

```typescript
// AppContext.tsx
interface AppState {
  goals: Goal[]
  budget: Budget
}

// État initial par défaut
const initialState: AppState = {
  goals: [],
  budget: {
    monthlyIncome: 0,
    fixedExpenses: [],
  },
}
```

### Rôles

- `AppProvider` : appelle `useReducer(appReducer, initialState)`, hydrate depuis localStorage au mount, synchronise vers localStorage via `useEffect` à chaque changement de state
- `AppReducer` : fonction pure qui délègue aux handlers goals/budget selon le type d'action
- `useAppContext()` : hook custom avec guard null — lance une erreur explicite si utilisé hors du Provider

### Stratégie localStorage (une seule source de vérité)

`AppProvider` est le seul responsable de la persistance :
```typescript
// Hydratation au mount (une seule fois)
useEffect(() => {
  const saved = localStorage.getItem('budgetflow_goals')
  if (saved) dispatch({ type: 'HYDRATE_GOALS', payload: JSON.parse(saved) })
}, [])

// Sync à chaque changement de state
useEffect(() => {
  localStorage.setItem('budgetflow_goals', JSON.stringify(state.goals))
  localStorage.setItem('budgetflow_budget', JSON.stringify(state.budget))
}, [state])
```

`useLocalStorage<T>` est utilisé **uniquement** dans `SettingsPage` pour l'export/import.

### Valeurs calculées (exposées par le context via useMemo)
- `availableMonthly` = revenus − somme dépenses fixes − totalAllocated
- `totalAllocated` = somme des `monthlyContribution` de tous les objectifs

### Contrats des hooks feature

```typescript
// useGoals.ts — retourne
interface UseGoalsReturn {
  goals: Goal[]
  addGoal: (goal: Omit<Goal, 'id' | 'createdAt'>) => void
  updateGoal: (goal: Goal) => void
  deleteGoal: (id: string) => void
  addContribution: (goalId: string, amount: number) => void
}

// useBudget.ts — retourne
interface UseBudgetReturn {
  budget: Budget
  availableMonthly: number
  setIncome: (amount: number) => void
  addExpense: (expense: Omit<FixedExpense, 'id'>) => void
  updateExpense: (expense: FixedExpense) => void
  deleteExpense: (id: string) => void
}
```

### Utilitaires goals

```typescript
// features/goals/utils/goalCalculations.ts
const monthsToGoal = (goal: Goal): number => { ... }
const percentComplete = (goal: Goal): number => { ... }
```

---

## 5. Pages & Navigation

| Page | Route | Responsabilité |
|------|-------|----------------|
| Dashboard | `/` | Vue globale, graphique recharts, budget disponible |
| Objectifs | `/goals` | CRUD objectifs, progress bars, modal formulaire |
| Budget | `/budget` | Saisie revenus et dépenses fixes, récapitulatif |
| Paramètres | `/settings` | Export JSON, import JSON, reset données |

**Layout :** Navbar fixe en haut + `<Outlet />` react-router-dom
**Style :** Clean, minimaliste, moderne — fond blanc/gris clair, accents indigo ou emerald

---

## 6. Hooks par page

| Page | Hooks utilisés |
|------|----------------|
| Dashboard | `useAppContext()`, `useMemo` |
| GoalsPage | `useGoals()`, `useState` (modal, formulaire) |
| BudgetPage | `useBudget()`, `useCallback` (handlers) |
| SettingsPage | `useLocalStorage<T>()`, `useRef` (input file import) |

---

## 7. Concepts React/TS couverts

| Concept | Où dans le projet |
|---------|------------------|
| `useState` | Formulaires, modals, toggle UI |
| `useEffect` | Sync localStorage dans AppProvider |
| `useContext` | Consommation AppContext partout |
| `useReducer` | AppReducer — state global |
| `useMemo` | Calculs dérivés (availableMonthly, totalAllocated) |
| `useCallback` | Handlers dans BudgetPage, GoalForm |
| `useRef` | Input file (import JSON) dans SettingsPage |
| `React.memo` | GoalCard — évite re-renders inutiles |
| Custom hooks | `useLocalStorage<T>`, `useGoals`, `useBudget` |
| Interfaces | Goal, Budget, FixedExpense, props composants |
| Types génériques | `useLocalStorage<T>` |
| Discriminated unions | `GoalAction`, `BudgetAction`, `AppAction` |
| `type` vs `interface` | Convention documentée (objets=interface, unions=type) |
| react-router-dom | Routes, `<Outlet>`, `useNavigate` |
| recharts | Graphique progression Dashboard |

---

## 8. Persistance des données

- **Sync state → localStorage :** géré exclusivement dans `AppProvider` via `useEffect`
- **Clés :** `budgetflow_goals`, `budgetflow_budget`
- **Export :** `useLocalStorage<T>` dans SettingsPage → téléchargement `budgetflow-export.json`
- **Import :** lecture fichier via `useRef` + input file → validation de la structure (vérifier présence des clés `goals` et `budget`) → `dispatch(HYDRATE)` si valide
- **Reset :** `localStorage.clear()` + dispatch vers state initial

### Validation import JSON
Avant d'hydrater le state depuis un fichier importé :
```typescript
const isValidExport = (data: unknown): data is AppState =>
  typeof data === 'object' &&
  data !== null &&
  'goals' in data &&
  'budget' in data &&
  Array.isArray((data as AppState).goals)
```

---

## 9. Validation des formulaires

Gestion native avec `useState` (pas de bibliothèque externe) :

| Champ | Règle |
|-------|-------|
| `name` | Requis, min 2 caractères |
| `targetAmount` | Requis, > 0 |
| `monthlyContribution` | Requis, > 0, ≤ targetAmount |
| `targetDate` | Requis, doit être dans le futur |
| `monthlyIncome` | Requis, ≥ 0 |
| `fixedExpense.amount` | Requis, > 0 |

---

## 10. Décisions techniques

- **Pas de backend** : tout en local, suffisant pour l'objectif d'apprentissage
- **Pas de bibliothèque de formulaires** (React Hook Form, Formik) : gestion native avec `useState`
- **Pas de bibliothèque de state** (Redux, Zustand) : Context + useReducer natif React
- **TailwindCSS** : classes utilitaires uniquement
- **Génération d'IDs** : `crypto.randomUUID()` (natif navigateur, pas de dépendance externe)
