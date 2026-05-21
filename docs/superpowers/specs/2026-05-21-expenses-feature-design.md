# BudgetFlow — Expenses Feature Design Spec
**Date:** 2026-05-21
**Stack:** React 19 + TypeScript + Vite + TailwindCSS + recharts
**Objectif:** Ajouter le suivi des dépenses réelles + analytique visuelle (donut chart par catégorie)

---

## 1. Contexte & Objectifs

BudgetFlow gère déjà les objectifs d'épargne et le budget mensuel (revenus - dépenses fixes). Il manque le suivi des **dépenses réelles** — ce que l'utilisateur dépense concrètement au quotidien.

Cette feature ajoute :
- Un CRUD complet de dépenses (ajout, édition, suppression)
- Des filtres par mois, catégorie et tag
- Un donut chart interactif (recharts) par catégorie
- Un widget résumé sur le Dashboard
- Une nouvelle page dédiée `/expenses`

Objectifs techniques : couvrir `useMemo`, CRUD via reducer, filtres, recharts `PieChart`, conventions de feature autonome.

---

## 2. Types TypeScript

```typescript
// src/features/expenses/types/expense.types.ts

type ExpenseCategory = 'food' | 'transport' | 'housing' | 'health' | 'leisure' | 'tech' | 'other'
type ExpenseTag = 'fixed' | 'variable' | 'leisure'

interface Expense {
  id: string
  amount: number
  category: ExpenseCategory
  description: string
  date: string        // ISO string YYYY-MM-DD
  tag: ExpenseTag
  createdAt: string   // ISO string
}

type ExpenseAction =
  | { type: 'ADD_EXPENSE'; payload: Omit<Expense, 'id' | 'createdAt'> }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: { id: string } }
```

---

## 3. Structure de fichiers

```
src/features/expenses/
  components/
    ExpenseForm.tsx           — formulaire ajout/édition, utilisé dans Modal
    ExpenseList.tsx           — liste filtrée des dépenses
    ExpenseCard.tsx           — une dépense avec actions edit/delete
    ExpenseCategoryChart.tsx  — donut chart recharts par catégorie
  hooks/
    useExpenses.ts            — CRUD + filtres + agrégations mémoïsées
  types/
    expense.types.ts
  utils/
    expenseCalculations.ts    — totalByCategory, totalByMonth, filterExpenses

src/pages/
  ExpensesPage.tsx            — nouvelle page /expenses

src/router/index.tsx          — ajout route /expenses
src/components/ui/SideBarMenu.tsx — ajout lien "Dépenses"
```

---

## 4. State global

### AppState

```typescript
interface AppState {
  goals: Goal[]
  budget: Budget
  expenses: Expense[]   // nouveau
}

const initialState: AppState = {
  goals: [],
  budget: { ... },
  expenses: [],
}
```

### AppReducer

```typescript
// AppAction = GoalAction | BudgetAction | ExpenseAction

case 'ADD_EXPENSE': {
  const newExpense: Expense = {
    ...action.payload,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  return { ...state, expenses: [...state.expenses, newExpense] }
}
case 'UPDATE_EXPENSE':
  return {
    ...state,
    expenses: state.expenses.map(e =>
      e.id === action.payload.id ? action.payload : e
    ),
  }
case 'DELETE_EXPENSE':
  return {
    ...state,
    expenses: state.expenses.filter(e => e.id !== action.payload.id),
  }
```

---

## 5. Hook `useExpenses`

Retourne `{ data, actions }` (convention projet).

```typescript
// data
data.expenses           // Expense[] — liste complète
data.filtered           // Expense[] — après filtres actifs
data.totalByCategory    // Record<ExpenseCategory, number> — useMemo
data.totalCurrentMonth  // number — useMemo

// actions
actions.add(payload: Omit<Expense, 'id' | 'createdAt'>): void
actions.update(expense: Expense): void
actions.remove(id: string): void
actions.setFilter(filter: ExpenseFilter): void

// type
interface ExpenseFilter {
  month?: string        // format YYYY-MM
  category?: ExpenseCategory | 'all'
  tag?: ExpenseTag | 'all'
}
```

`totalByCategory` et `totalCurrentMonth` sont calculés avec `useMemo` — ils ne se recalculent que si `expenses` ou le filtre de mois change.

---

## 6. Composants

### `ExpenseForm.tsx`

Formulaire contrôlé avec les champs : `amount` (number), `category` (select), `description` (text), `date` (date), `tag` (select).

Utilisé en mode création (sans `expense` prop) et édition (avec `expense` prop pré-rempli). Ouvert via le composant `Modal` existant.

### `ExpenseCard.tsx`

Affiche : description, catégorie, tag, date, montant. Boutons edit (ouvre modal) et delete (confirmation inline ou simple click).

### `ExpenseList.tsx`

- Barre de filtres : sélecteur de mois, catégorie, tag
- Liste de `ExpenseCard`
- Message vide si aucune dépense après filtrage
- Total affiché en bas de liste

### `ExpenseCategoryChart.tsx`

Recharts `PieChart` + `Pie` avec `innerRadius` (donut). `Tooltip` personnalisé. `Legend` avec noms et montants. Données issues de `data.totalByCategory` (via `useExpenses`).

```typescript
interface ChartEntry {
  name: string
  value: number
  color: string
}
// Couleur assignée par catégorie via un Record<ExpenseCategory, string>
```

---

## 7. Page `ExpensesPage.tsx`

Layout :
```
┌─────────────────────────────────────┐
│  Dépenses          [+ Ajouter]      │
├──────────────┬──────────────────────┤
│  DonutChart  │  Résumé du mois      │
│  (catégories)│  Total: 485€         │
│              │  12 dépenses         │
├──────────────┴──────────────────────┤
│  Filtres : [mois] [catégorie] [tag] │
│  ExpenseList                        │
└─────────────────────────────────────┘
```

---

## 8. Mise à jour Dashboard

Dans `DashboardPage`, nouveau widget **"Dépenses du mois"** sous `GlobalProgress` :
- Version compacte du donut chart
- Top 3 catégories avec montants
- Lien "Voir tout →" vers `/expenses`

Aucun hook ou type propre au dashboard — il consomme `useExpenses()` directement (même convention que maintenant).

---

## 9. Navigation

Nouvel item dans `SideBarMenu` :
```
Dashboard | Budget | Dépenses | Objectifs | Paramètres
```

Route ajoutée dans `src/router/index.tsx` : `/expenses` → `ExpensesPage`

---

## 10. Persistance

Les dépenses sont incluses dans la sync `localStorage` existante dans `AppProvider` (même pattern que goals et budget). Aucune modification nécessaire à la logique de persistance — l'ajout de `expenses` dans `AppState` suffit.
