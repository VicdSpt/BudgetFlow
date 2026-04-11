# BudgetFlow — Référence Théorique React + TypeScript

> Ce document centralise tous les concepts React/TS utilisés dans le projet, avec des explications et des exemples concrets tirés du code de BudgetFlow. Il sert de fiche de révision pour les interviews.

---

## Table des matières

1. [useState](#1-usestate)
2. [useEffect](#2-useeffect)
3. [useContext](#3-usecontext)
4. [useReducer](#4-usereducer)
5. [useMemo](#5-usememo)
6. [useCallback](#6-usecallback)
7. [useRef](#7-useref)
8. [React.memo](#8-reactmemo)
9. [Custom Hooks](#9-custom-hooks)
10. [TypeScript — Interfaces](#10-typescript--interfaces)
11. [TypeScript — Types & Unions](#11-typescript--types--unions)
12. [TypeScript — Discriminated Unions](#12-typescript--discriminated-unions)
13. [TypeScript — Génériques](#13-typescript--génériques)
14. [Context + useReducer (pattern global state)](#14-context--usereducer-pattern-global-state)
15. [react-router-dom](#15-react-router-dom)

---

## 1. useState

### Théorie
`useState` est le hook fondamental de React pour gérer un état local dans un composant fonctionnel. Il retourne un tableau de deux éléments : la valeur actuelle et une fonction pour la mettre à jour. Chaque appel à la fonction de mise à jour provoque un re-render du composant.

```typescript
const [value, setValue] = useState<Type>(initialValue)
```

### Règles importantes
- Ne jamais modifier la valeur directement (`value.push(...)` est interdit) — toujours passer par le setter
- Pour les objets/tableaux, toujours créer une nouvelle référence (immuabilité)
- Le state est local au composant — il n'est pas partagé avec les autres composants

### Exemple dans BudgetFlow
Gestion de l'ouverture/fermeture d'une modale dans `GoalsPage` :

```typescript
// GoalsPage.tsx
const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

const handleOpenAdd = () => setIsModalOpen(true)
const handleOpenEdit = (goal: Goal) => {
  setEditingGoal(goal)
  setIsModalOpen(true)
}
const handleClose = () => {
  setEditingGoal(null)
  setIsModalOpen(false)
}
```

Gestion d'un formulaire contrôlé :

```typescript
// GoalForm.tsx
interface GoalFormData {
  name: string
  targetAmount: string
  monthlyContribution: string
  targetDate: string
  category: GoalCategory
}

const [formData, setFormData] = useState<GoalFormData>({
  name: '',
  targetAmount: '',
  monthlyContribution: '',
  targetDate: '',
  category: 'other',
})

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
}
```

> **En interview :** On peut te demander pourquoi on utilise `prev =>` dans le setter. La réponse : pour s'assurer d'avoir la valeur la plus récente du state, surtout quand plusieurs mises à jour sont groupées par React (batching).

---

## 2. useEffect

### Théorie
`useEffect` permet d'exécuter des effets de bord (side effects) dans un composant : appels API, abonnements, manipulations du DOM, synchronisation avec localStorage, etc.

```typescript
useEffect(() => {
  // code exécuté après le render

  return () => {
    // cleanup (optionnel) — exécuté avant le prochain effet ou au démontage
  }
}, [dependencies]) // tableau de dépendances
```

### Tableau de dépendances
| Cas | Comportement |
|-----|-------------|
| `[]` (vide) | S'exécute une seule fois après le premier render (équivalent componentDidMount) |
| `[a, b]` | S'exécute à chaque fois que `a` ou `b` change |
| Absent | S'exécute après chaque render (rare, souvent un bug) |

### Exemple dans BudgetFlow
Synchronisation du state global vers localStorage dans `AppProvider` :

```typescript
// AppProvider.tsx

// Hydratation au démarrage (une seule fois)
useEffect(() => {
  const savedGoals = localStorage.getItem('budgetflow_goals')
  const savedBudget = localStorage.getItem('budgetflow_budget')
  if (savedGoals) dispatch({ type: 'HYDRATE_GOALS', payload: JSON.parse(savedGoals) })
  if (savedBudget) dispatch({ type: 'HYDRATE_BUDGET', payload: JSON.parse(savedBudget) })
}, []) // [] = une seule fois au mount

// Sync automatique à chaque changement de state
useEffect(() => {
  localStorage.setItem('budgetflow_goals', JSON.stringify(state.goals))
  localStorage.setItem('budgetflow_budget', JSON.stringify(state.budget))
}, [state]) // se déclenche à chaque fois que state change
```

> **En interview :** On peut te demander ce qui se passe si tu oublies le tableau de dépendances. Réponse : l'effet tourne après chaque render, ce qui peut créer des boucles infinies.

---

## 3. useContext

### Théorie
`useContext` permet à un composant de consommer une valeur partagée sans avoir à passer des props à travers chaque niveau de l'arbre (prop drilling).

```typescript
const value = useContext(MyContext)
```

Il faut d'abord créer un context avec `createContext`, puis le fournir avec un `Provider`.

### Exemple dans BudgetFlow

```typescript
// AppContext.tsx
import { createContext, useContext } from 'react'

interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  availableMonthly: number
  totalAllocated: number
}

// Création du context — null par défaut (avant que le Provider existe)
const AppContext = createContext<AppContextType | null>(null)

// Hook custom avec guard de sécurité
export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}

export default AppContext
```

Utilisation dans un composant :

```typescript
// GoalCard.tsx
const { state, dispatch } = useAppContext()
```

> **En interview :** On peut te demander ce qu'est le "prop drilling" et pourquoi Context résout ce problème. C'est le passage de props de parent en enfant en enfant juste pour atteindre un composant profond.

---

## 4. useReducer

### Théorie
`useReducer` est une alternative à `useState` pour gérer un état complexe avec plusieurs sous-valeurs ou une logique de mise à jour élaborée. Il suit le pattern Redux : un état + des actions + une fonction pure (reducer).

```typescript
const [state, dispatch] = useReducer(reducer, initialState)
```

Le reducer est une **fonction pure** : pour les mêmes entrées, il retourne toujours la même sortie, sans effets de bord.

```typescript
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ACTION_TYPE':
      return { ...state, /* modifications */ }
    default:
      return state
  }
}
```

### Exemple dans BudgetFlow

```typescript
// AppReducer.ts
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_GOAL':
      const newGoal: Goal = {
        ...action.payload,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      }
      return { ...state, goals: [...state.goals, newGoal] }

    case 'DELETE_GOAL':
      return {
        ...state,
        goals: state.goals.filter(g => g.id !== action.payload),
      }

    case 'SET_INCOME':
      return {
        ...state,
        budget: { ...state.budget, monthlyIncome: action.payload },
      }

    default:
      return state
  }
}
```

> **En interview :** On te demande souvent `useState` vs `useReducer`. Règle simple : `useState` pour des valeurs simples/indépendantes, `useReducer` quand les transitions d'état sont complexes ou quand plusieurs valeurs évoluent ensemble.

---

## 5. useMemo

### Théorie
`useMemo` mémoïse le résultat d'un calcul coûteux. Il ne recalcule que si ses dépendances changent, évitant des recalculs inutiles à chaque render.

```typescript
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b])
```

### Exemple dans BudgetFlow
Calcul du budget disponible mensuel dans le context :

```typescript
// AppProvider.tsx
const totalAllocated = useMemo(
  () => state.goals.reduce((sum, goal) => sum + goal.monthlyContribution, 0),
  [state.goals]
)

const availableMonthly = useMemo(
  () => {
    const totalFixed = state.budget.fixedExpenses.reduce((sum, e) => sum + e.amount, 0)
    return state.budget.monthlyIncome - totalFixed - totalAllocated
  },
  [state.budget, totalAllocated]
)
```

> **En interview :** Ne pas abuser de `useMemo`. Si le calcul est rapide (quelques additions), le coût de la mémoïsation peut dépasser le bénéfice. À utiliser pour des calculs vraiment coûteux ou pour stabiliser des références.

---

## 6. useCallback

### Théorie
`useCallback` mémoïse une fonction pour que sa référence reste stable entre les renders. Utile quand une fonction est passée en prop à un composant enfant mémoïsé (`React.memo`), pour éviter de le re-render inutilement.

```typescript
const memoizedFn = useCallback(() => {
  doSomething(a, b)
}, [a, b])
```

### Exemple dans BudgetFlow

```typescript
// BudgetPage.tsx
const handleSetIncome = useCallback((amount: number) => {
  dispatch({ type: 'SET_INCOME', payload: amount })
}, [dispatch]) // dispatch est stable, donc handleSetIncome l'est aussi

const handleDeleteExpense = useCallback((id: string) => {
  dispatch({ type: 'DELETE_EXPENSE', payload: id })
}, [dispatch])
```

> **En interview :** `useCallback` et `useMemo` vont souvent ensemble avec `React.memo`. Sans `React.memo` sur l'enfant, `useCallback` n'a aucun intérêt.

---

## 7. useRef

### Théorie
`useRef` retourne un objet mutable `{ current: value }` qui persiste entre les renders **sans provoquer de re-render** quand il change. Utilisé pour :
- Accéder directement à un élément DOM
- Stocker une valeur qui ne doit pas déclencher de re-render

```typescript
const ref = useRef<Type>(initialValue)
// Accès : ref.current
```

### Exemple dans BudgetFlow
Accès à l'input file dans `SettingsPage` pour l'import JSON :

```typescript
// SettingsPage.tsx
const fileInputRef = useRef<HTMLInputElement>(null)

const handleImportClick = () => {
  fileInputRef.current?.click() // déclenche l'ouverture du sélecteur de fichier
}

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return
  // lecture du fichier...
}

return (
  <>
    <button onClick={handleImportClick}>Importer JSON</button>
    <input
      ref={fileInputRef}
      type="file"
      accept=".json"
      onChange={handleFileChange}
      className="hidden"
    />
  </>
)
```

---

## 8. React.memo

### Théorie
`React.memo` est un Higher Order Component (HOC) qui mémoïse un composant. Il ne re-render que si ses props changent (comparaison superficielle par défaut).

```typescript
const MyComponent = React.memo(({ prop }: Props) => {
  return <div>{prop}</div>
})
```

### Exemple dans BudgetFlow

```typescript
// GoalCard.tsx
interface GoalCardProps {
  goal: Goal
  onEdit: (goal: Goal) => void
  onDelete: (id: string) => void
}

const GoalCard = React.memo(({ goal, onEdit, onDelete }: GoalCardProps) => {
  return (
    <div>
      <h3>{goal.name}</h3>
      <p>{goal.targetAmount}€</p>
      <button onClick={() => onEdit(goal)}>Éditer</button>
      <button onClick={() => onDelete(goal.id)}>Supprimer</button>
    </div>
  )
})

export default GoalCard
```

> **En interview :** `React.memo` est utile quand un composant parent re-render souvent mais que les props de l'enfant ne changent pas. À combiner avec `useCallback` pour les fonctions passées en props.

---

## 9. Custom Hooks

### Théorie
Un custom hook est une fonction JavaScript dont le nom commence par `use` et qui peut appeler d'autres hooks. Il permet d'extraire et de réutiliser de la logique stateful entre plusieurs composants.

```typescript
function useMyHook(param: Type): ReturnType {
  const [state, setState] = useState(...)
  // logique...
  return { state, actions }
}
```

### Exemple dans BudgetFlow

```typescript
// hooks/useLocalStorage.ts
function useLocalStorage<T>(key: StorageKey, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = (value: T) => {
    setStoredValue(value)
    localStorage.setItem(key, JSON.stringify(value))
  }

  return [storedValue, setValue]
}
```

```typescript
// features/goals/hooks/useGoals.ts
function useGoals(): UseGoalsReturn {
  const { state, dispatch } = useAppContext()

  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_GOAL', payload: goal })
  }, [dispatch])

  const deleteGoal = useCallback((id: string) => {
    dispatch({ type: 'DELETE_GOAL', payload: id })
  }, [dispatch])

  return { goals: state.goals, addGoal, deleteGoal, /* ... */ }
}
```

> **En interview :** Les custom hooks montrent que tu sais abstraire la logique et écrire du code réutilisable. C'est une compétence très appréciée.

---

## 10. TypeScript — Interfaces

### Théorie
Une `interface` décrit la forme d'un objet. Elle est extensible (on peut la faire hériter d'une autre) et recommandée pour les entités et les props de composants.

```typescript
interface MyInterface {
  property: Type
  optionalProperty?: Type
  readonlyProperty: readonly Type
}
```

### Convention dans BudgetFlow
> `interface` pour les formes d'objets (entités, props), `type` pour les unions et aliases.

### Exemple dans BudgetFlow

```typescript
// features/goals/types/goal.type.ts
export interface Goal {
  id: string
  name: string
  description: string
  targetSavings: number
  currentSavings: number
  deadlineDate?: string   // ← optionnel avec ?
  status: GoalStatus      // ← référence au type séparé
}

// Props d'un composant
interface GoalCardProps {
  goal: Goal
  onEdit: (goal: Goal) => void
  onDelete: (id: string) => void
}
```

### Propriété optionnelle
Le `?` après le nom d'une propriété la rend optionnelle — TypeScript acceptera un objet `Goal` avec ou sans `deadlineDate`.

```typescript
const goal1: Goal = { id: '1', name: 'Moto', ..., status: 'active' }              // ✅ sans deadlineDate
const goal2: Goal = { id: '2', name: 'Voyage', ..., deadlineDate: '2026-12-01', status: 'active' } // ✅ avec
```

### Tableau de types — quand utiliser quoi

| Situation | Outil |
|-----------|-------|
| Objet avec des propriétés | `interface` |
| Choix parmi des valeurs fixes | `type` + union `\|` |
| Propriété optionnelle | `?` |
| Liste d'objets | `Type[]` |
| Valeur numérique contrainte | `number` (pas `string`) |

---

## 11. TypeScript — Types & Unions

### Théorie
`type` est plus flexible qu'`interface` : il peut représenter des unions, des intersections, des types primitifs, des tuples, etc.

```typescript
type MyUnion = 'a' | 'b' | 'c'
type MyIntersection = TypeA & TypeB
type MyAlias = string
```

`Omit<T, K>` et `Pick<T, K>` sont des **utility types** intégrés à TypeScript très utiles :

```typescript
type NewGoal = Omit<Goal, 'id' | 'createdAt'>  // Goal sans id ni createdAt
type GoalName = Pick<Goal, 'name' | 'color'>    // seulement name et color
```

### Exemple dans BudgetFlow

```typescript
// features/goals/types/goal.type.ts
export type GoalStatus = 'active' | 'completed' | 'paused'
```

**Pourquoi un `type` séparé et pas inline dans l'interface ?**
Parce que d'autres parties du code (filtres, badges de couleur, etc.) pourront importer `GoalStatus` directement sans dépendre de toute l'interface `Goal`.

```typescript
// Utilisation dans un autre composant
import type { GoalStatus } from '../types/goal.type'

function StatusBadge({ status }: { status: GoalStatus }) { ... }
```

**Utility types** — intégrés à TypeScript, très utiles :

```typescript
type StorageKey = 'budgetflow_goals' | 'budgetflow_budget'

// Omit pour le formulaire de création (sans id)
type NewGoalPayload = Omit<Goal, 'id'>
```

---

## 12. TypeScript — Discriminated Unions

### Théorie
Une **discriminated union** (union discriminée) est un type union où chaque variant possède une propriété commune (le "discriminant") qui permet à TypeScript de savoir exactement quel type on manipule.

```typescript
type Action =
  | { type: 'ADD'; payload: Item }
  | { type: 'DELETE'; payload: string }
  | { type: 'RESET' }
```

TypeScript utilise `type` comme discriminant pour **narrower** automatiquement le type dans un `switch`.

### Exemple dans BudgetFlow

```typescript
// common.types.ts
type AppAction = GoalAction | BudgetAction

// AppReducer.ts
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'ADD_GOAL':
      // TypeScript sait ici que action.payload est Omit<Goal, 'id' | 'createdAt'>
      return { ...state, goals: [...state.goals, { ...action.payload, id: crypto.randomUUID(), createdAt: new Date().toISOString() }] }

    case 'DELETE_GOAL':
      // TypeScript sait ici que action.payload est string
      return { ...state, goals: state.goals.filter(g => g.id !== action.payload) }

    default:
      return state
  }
}
```

> **En interview :** Les discriminated unions sont très appréciées car elles montrent une maîtrise avancée de TypeScript. Elles rendent les reducers type-safe et auto-documentés.

---

## 13. TypeScript — Génériques

### Théorie
Les génériques permettent d'écrire du code réutilisable qui fonctionne avec plusieurs types. On les déclare avec `<T>`.

```typescript
function identity<T>(value: T): T {
  return value
}
```

### Exemple dans BudgetFlow

```typescript
// hooks/useLocalStorage.ts
// <T> permet au hook de fonctionner avec n'importe quel type de données
function useLocalStorage<T>(key: StorageKey, initialValue: T): [T, (value: T) => void] {
  // ...
}

// Utilisation typée
const [goals, setGoals] = useLocalStorage<Goal[]>('budgetflow_goals', [])
const [budget, setBudget] = useLocalStorage<Budget>('budgetflow_budget', { monthlyIncome: 0, fixedExpenses: [] })
```

---

## 14. Context + useReducer (pattern global state)

### Théorie
La combinaison `Context + useReducer` est le pattern React natif pour gérer un état global sans bibliothèque externe. Il reproduit les concepts de Redux :

| Redux | React natif |
|-------|------------|
| `store` | `AppProvider` (useReducer) |
| `reducer` | `appReducer` |
| `dispatch` | `dispatch` (retourné par useReducer) |
| `connect` / `useSelector` | `useContext` / `useAppContext` |
| `actions` | `AppAction` (discriminated union) |

### Flux complet dans BudgetFlow

```
Composant
  → appelle dispatch({ type: 'ADD_GOAL', payload: {...} })
  → AppReducer reçoit l'action et retourne un nouveau state
  → AppProvider met à jour le state via useReducer
  → useEffect dans AppProvider synchronise localStorage
  → Tous les composants consommant useAppContext() re-rendent avec le nouveau state
```

### Exemple complet

```typescript
// AppProvider.tsx
export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  // Sync localStorage
  useEffect(() => {
    localStorage.setItem('budgetflow_goals', JSON.stringify(state.goals))
    localStorage.setItem('budgetflow_budget', JSON.stringify(state.budget))
  }, [state])

  const totalAllocated = useMemo(
    () => state.goals.reduce((sum, g) => sum + g.monthlyContribution, 0),
    [state.goals]
  )

  const availableMonthly = useMemo(
    () => state.budget.monthlyIncome - state.budget.fixedExpenses.reduce((s, e) => s + e.amount, 0) - totalAllocated,
    [state.budget, totalAllocated]
  )

  return (
    <AppContext.Provider value={{ state, dispatch, totalAllocated, availableMonthly }}>
      {children}
    </AppContext.Provider>
  )
}
```

---

## 15. react-router-dom

### Théorie
`react-router-dom` gère la navigation côté client (SPA). Les routes sont déclarées en JSX et le rendu change selon l'URL, sans rechargement de page.

```typescript
// Composants clés
<BrowserRouter>    // fournit le contexte de routing
<Routes>           // contient les Route
<Route path="/" element={<Page />} />
<Outlet />         // rendu des routes enfant dans un layout
<Link to="/page">  // navigation sans rechargement
```

### Hooks utiles
```typescript
const navigate = useNavigate()   // navigation programmatique
const { id } = useParams()       // paramètres d'URL (/goals/:id)
const location = useLocation()   // URL actuelle
```

### Exemple dans BudgetFlow

```typescript
// router/index.tsx
import { createBrowserRouter } from 'react-router-dom'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,     // Navbar + <Outlet />
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'goals', element: <GoalsPage /> },
      { path: 'budget', element: <BudgetPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])

// main.tsx
<RouterProvider router={router} />
```

---

*Document mis à jour au fur et à mesure de l'avancement du projet.*
