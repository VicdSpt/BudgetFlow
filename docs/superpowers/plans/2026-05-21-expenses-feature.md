# Expenses Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter le suivi des dépenses réelles (transactions quotidiennes) avec CRUD complet, filtres par mois/catégorie/tag, et un donut chart interactif par catégorie.

**Architecture:** Nouvelle feature autonome `src/features/transactions/` (composants, hook, types, utils) suivant exactement le même pattern que `goals/` et `budget/`. Les données sont stockées dans `AppState.transactions[]` via de nouveaux action types (`ADD_TRANSACTION`, `UPDATE_TRANSACTION`, `DELETE_TRANSACTION`) pour éviter tout conflit avec les actions `FixedExpense` déjà existantes (`ADD_EXPENSE`, `UPDATE_EXPENSE`, `DELETE_EXPENSE`). Une nouvelle page `/transactions` est ajoutée, et le Dashboard reçoit un widget résumé.

**Tech Stack:** React 19 + TypeScript + Tailwind CSS + recharts (`PieChart`, `Pie`, `Tooltip`, `Legend`) + Context API + useReducer + useMemo

---

## File Map

| Fichier | Action | Responsabilité |
|---------|--------|----------------|
| `src/features/transactions/types/transaction.types.ts` | Créer | Types `Transaction`, `TransactionCategory`, `TransactionTag`, `TransactionAction`, `TransactionFilter` |
| `src/features/transactions/utils/transactionCalculations.ts` | Créer | `totalByCategory`, `totalForMonth`, `filterTransactions` |
| `src/features/transactions/hooks/useTransactions.ts` | Créer | CRUD + filtres + agrégations mémoïsées |
| `src/features/transactions/components/TransactionForm.tsx` | Créer | Formulaire ajout/édition (utilisé dans Modal) |
| `src/features/transactions/components/TransactionCard.tsx` | Créer | Une transaction avec actions edit/delete |
| `src/features/transactions/components/TransactionList.tsx` | Créer | Liste filtrée + barre de filtres |
| `src/features/transactions/components/TransactionCategoryChart.tsx` | Créer | Donut chart recharts par catégorie |
| `src/pages/TransactionsPage.tsx` | Créer | Page `/transactions` |
| `src/types/common.type.ts` | Modifier | Ajouter `transactions: Transaction[]` à `AppState` + `TransactionAction` à `AppAction` |
| `src/context/AppReducer.ts` | Modifier | Ajouter les 3 nouveaux cases |
| `src/context/AppProvider.tsx` | Modifier | Persister `transactions` dans localStorage |
| `src/router/index.tsx` | Modifier | Ajouter route `/transactions` |
| `src/components/ui/SideBarMenu.tsx` | Modifier | Ajouter lien "Dépenses" |
| `src/features/dashboard/components/GlobalProgress.tsx` | Modifier | Ajouter widget résumé transactions |

---

## Task 1 : Types

**Files:**
- Create: `src/features/transactions/types/transaction.types.ts`

- [ ] **Créer le fichier de types**

```typescript
// src/features/transactions/types/transaction.types.ts

export type TransactionCategory =
  | 'food'
  | 'transport'
  | 'housing'
  | 'health'
  | 'leisure'
  | 'tech'
  | 'other'

export type TransactionTag = 'fixed' | 'variable' | 'leisure'

export interface Transaction {
  id: string
  amount: number
  category: TransactionCategory
  description: string
  date: string       // ISO string YYYY-MM-DD
  tag: TransactionTag
  createdAt: string  // ISO string
}

export interface TransactionFilter {
  month: string                      // format YYYY-MM, ex: "2026-05"
  category: TransactionCategory | 'all'
  tag: TransactionTag | 'all'
}

export type TransactionAction =
  | { type: 'ADD_TRANSACTION'; payload: Omit<Transaction, 'id' | 'createdAt'> }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
```

- [ ] **Commit**

```bash
git add src/features/transactions/types/transaction.types.ts
git commit -m "feat: add Transaction types"
```

---

## Task 2 : Utils

**Files:**
- Create: `src/features/transactions/utils/transactionCalculations.ts`

- [ ] **Créer les fonctions utilitaires**

```typescript
// src/features/transactions/utils/transactionCalculations.ts

import type { Transaction, TransactionCategory, TransactionFilter } from '../types/transaction.types'

export const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  food:      '#6366f1',
  transport: '#f59e0b',
  housing:   '#10b981',
  health:    '#ef4444',
  leisure:   '#8b5cf6',
  tech:      '#3b82f6',
  other:     '#94a3b8',
}

export const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  food:      'Alimentation',
  transport: 'Transport',
  housing:   'Logement',
  health:    'Santé',
  leisure:   'Loisirs',
  tech:      'Tech',
  other:     'Autre',
}

export function totalByCategory(
  transactions: Transaction[]
): Record<TransactionCategory, number> {
  return transactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + t.amount
    return acc
  }, {} as Record<TransactionCategory, number>)
}

export function totalForMonth(transactions: Transaction[], month: string): number {
  return transactions
    .filter(t => t.date.startsWith(month))
    .reduce((sum, t) => sum + t.amount, 0)
}

export function filterTransactions(
  transactions: Transaction[],
  filter: TransactionFilter
): Transaction[] {
  return transactions.filter(t => {
    const matchMonth = t.date.startsWith(filter.month)
    const matchCategory = filter.category === 'all' || t.category === filter.category
    const matchTag = filter.tag === 'all' || t.tag === filter.tag
    return matchMonth && matchCategory && matchTag
  })
}

export function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}
```

- [ ] **Commit**

```bash
git add src/features/transactions/utils/transactionCalculations.ts
git commit -m "feat: add transaction calculation utils"
```

---

## Task 3 : State global — types

**Files:**
- Modify: `src/types/common.type.ts`

- [ ] **Ajouter `Transaction` et `TransactionAction` à common.type.ts**

Remplacer le contenu de `src/types/common.type.ts` par :

```typescript
import type { Goal } from '../features/goals/types/goal.type'
import type {
  FixedExpense,
  GlobalBudget,
  MonthlyIncome,
} from '../features/budget/types/budget.type'
import type { Transaction, TransactionAction } from '../features/transactions/types/transaction.types'

export type StorageKey = 'budgetflow_goals' | 'budgetflow_budget' | 'budgetflow_transactions'

export type AppState = {
  goals: Goal[]
  budget: GlobalBudget
  transactions: Transaction[]
}

export type AppAction =
  | { type: 'ADD_GOAL'; payload: Omit<Goal, 'id'> }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'HYDRATE_GOALS'; payload: Goal[] }
  | { type: 'HYDRATE_BUDGET'; payload: GlobalBudget }
  | { type: 'SET_MONTHLY_INCOME'; payload: MonthlyIncome }
  | { type: 'ADD_EXPENSE'; payload: Omit<FixedExpense, 'id'> }
  | { type: 'UPDATE_EXPENSE'; payload: FixedExpense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'RESET_INCOME' }
  | { type: 'RESET_EXPENSES' }
  | TransactionAction
```

- [ ] **Commit**

```bash
git add src/types/common.type.ts
git commit -m "feat: add Transaction to AppState and AppAction"
```

---

## Task 4 : AppReducer

**Files:**
- Modify: `src/context/AppReducer.ts`

- [ ] **Ajouter les 3 nouveaux cases dans le switch**

Ajouter ces cases avant le `default` dans `src/context/AppReducer.ts` :

```typescript
case 'ADD_TRANSACTION': {
  const newTransaction: Transaction = {
    ...action.payload,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  }
  return { ...state, transactions: [...state.transactions, newTransaction] }
}

case 'UPDATE_TRANSACTION':
  return {
    ...state,
    transactions: state.transactions.map(t =>
      t.id === action.payload.id ? action.payload : t
    ),
  }

case 'DELETE_TRANSACTION':
  return {
    ...state,
    transactions: state.transactions.filter(t => t.id !== action.payload),
  }
```

Ajouter l'import en haut du fichier :

```typescript
import type { Transaction } from '../features/transactions/types/transaction.types'
```

- [ ] **Commit**

```bash
git add src/context/AppReducer.ts
git commit -m "feat: add transaction reducer cases"
```

---

## Task 5 : AppProvider — localStorage

**Files:**
- Modify: `src/context/AppProvider.tsx`

- [ ] **Ajouter la persistance des transactions**

Modifier `src/context/AppProvider.tsx` :

```typescript
import { useReducer, useEffect } from 'react'
import AppContext from './AppContext'
import { appReducer } from './AppReducer'
import type { AppState } from '../types/common.type'

const emptyBudget = { monthlyIncomes: [], spendingList: [] }

const getInitialState = (): AppState => {
  try {
    const savedGoals = localStorage.getItem('budgetflow_goals')
    const savedBudget = localStorage.getItem('budgetflow_budget')
    const savedTransactions = localStorage.getItem('budgetflow_transactions')
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
  const [state, dispatch] = useReducer(appReducer, getInitialState())

  useEffect(() => {
    localStorage.setItem('budgetflow_goals', JSON.stringify(state.goals))
    localStorage.setItem('budgetflow_budget', JSON.stringify(state.budget))
    localStorage.setItem('budgetflow_transactions', JSON.stringify(state.transactions))
  }, [state])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}
```

- [ ] **Commit**

```bash
git add src/context/AppProvider.tsx
git commit -m "feat: persist transactions in localStorage"
```

---

## Task 6 : Hook `useTransactions`

**Files:**
- Create: `src/features/transactions/hooks/useTransactions.ts`

- [ ] **Créer le hook**

```typescript
// src/features/transactions/hooks/useTransactions.ts

import { useMemo, useState } from 'react'
import { useAppContext } from '../../../context/AppContext'
import {
  filterTransactions,
  totalByCategory,
  totalForMonth,
  getCurrentMonth,
} from '../utils/transactionCalculations'
import type { Transaction, TransactionFilter } from '../types/transaction.types'

export function useTransactions() {
  const { state, dispatch } = useAppContext()

  const [filter, setFilter] = useState<TransactionFilter>({
    month: getCurrentMonth(),
    category: 'all',
    tag: 'all',
  })

  const filtered = useMemo(
    () => filterTransactions(state.transactions, filter),
    [state.transactions, filter]
  )

  const categoryTotals = useMemo(
    () => totalByCategory(filtered),
    [filtered]
  )

  const totalCurrentMonth = useMemo(
    () => totalForMonth(state.transactions, filter.month),
    [state.transactions, filter.month]
  )

  const add = (payload: Omit<Transaction, 'id' | 'createdAt'>) => {
    dispatch({ type: 'ADD_TRANSACTION', payload })
  }

  const update = (transaction: Transaction) => {
    dispatch({ type: 'UPDATE_TRANSACTION', payload: transaction })
  }

  const remove = (id: string) => {
    dispatch({ type: 'DELETE_TRANSACTION', payload: id })
  }

  return {
    transactions: state.transactions,
    filtered,
    categoryTotals,
    totalCurrentMonth,
    filter,
    setFilter,
    add,
    update,
    remove,
  }
}
```

- [ ] **Commit**

```bash
git add src/features/transactions/hooks/useTransactions.ts
git commit -m "feat: add useTransactions hook"
```

---

## Task 7 : `TransactionForm`

**Files:**
- Create: `src/features/transactions/components/TransactionForm.tsx`

- [ ] **Créer le formulaire**

```typescript
// src/features/transactions/components/TransactionForm.tsx

import { useState } from 'react'
import type { Transaction, TransactionCategory, TransactionTag } from '../types/transaction.types'
import { CATEGORY_LABELS } from '../utils/transactionCalculations'
import Input from '../../../components/ui/Input'
import Button from '../../../components/ui/Button'

interface TransactionFormProps {
  initial?: Transaction
  onSubmit: (data: Omit<Transaction, 'id' | 'createdAt'>) => void
  onCancel: () => void
}

const TAG_LABELS: Record<TransactionTag, string> = {
  fixed: 'Fixe',
  variable: 'Variable',
  leisure: 'Loisir',
}

export default function TransactionForm({ initial, onSubmit, onCancel }: TransactionFormProps) {
  const today = new Date().toISOString().split('T')[0]

  const [amount, setAmount] = useState(initial ? String(initial.amount) : '')
  const [category, setCategory] = useState<TransactionCategory>(initial?.category ?? 'other')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [date, setDate] = useState(initial?.date ?? today)
  const [tag, setTag] = useState<TransactionTag>(initial?.tag ?? 'variable')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !description || !date) return
    onSubmit({ amount: parseFloat(amount), category, description, date, tag })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Montant (€)</label>
        <Input
          type="number"
          min="0"
          step="0.01"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
        <Input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Ex: Courses Carrefour"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value as TransactionCategory)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          {(Object.keys(CATEGORY_LABELS) as TransactionCategory[]).map(cat => (
            <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Tag</label>
        <select
          value={tag}
          onChange={e => setTag(e.target.value as TransactionTag)}
          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          {(Object.keys(TAG_LABELS) as TransactionTag[]).map(t => (
            <option key={t} value={t}>{TAG_LABELS[t]}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
        <Input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          required
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-1">
          {initial ? 'Mettre à jour' : 'Ajouter'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Annuler
        </Button>
      </div>
    </form>
  )
}
```

- [ ] **Commit**

```bash
git add src/features/transactions/components/TransactionForm.tsx
git commit -m "feat: add TransactionForm component"
```

---

## Task 8 : `TransactionCard`

**Files:**
- Create: `src/features/transactions/components/TransactionCard.tsx`

- [ ] **Créer la carte de transaction**

```typescript
// src/features/transactions/components/TransactionCard.tsx

import type { Transaction } from '../types/transaction.types'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../utils/transactionCalculations'

interface TransactionCardProps {
  transaction: Transaction
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

const TAG_LABELS = { fixed: 'Fixe', variable: 'Variable', leisure: 'Loisir' }

export default function TransactionCard({ transaction, onEdit, onDelete }: TransactionCardProps) {
  const color = CATEGORY_COLORS[transaction.category]

  return (
    <div className="flex items-center justify-between py-3 px-4 rounded-xl border border-slate-100 bg-white hover:border-slate-200 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <div>
          <p className="text-sm font-medium text-slate-800">{transaction.description}</p>
          <p className="text-xs text-slate-400 mt-0.5">
            {CATEGORY_LABELS[transaction.category]} · {TAG_LABELS[transaction.tag]} · {transaction.date}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-slate-800">-{transaction.amount.toFixed(2)}€</span>
        <button
          onClick={() => onEdit(transaction)}
          className="text-xs text-slate-400 hover:text-slate-700 transition-colors"
        >
          Éditer
        </button>
        <button
          onClick={() => onDelete(transaction.id)}
          className="text-xs text-rose-400 hover:text-rose-600 transition-colors"
        >
          Supprimer
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Commit**

```bash
git add src/features/transactions/components/TransactionCard.tsx
git commit -m "feat: add TransactionCard component"
```

---

## Task 9 : `TransactionList`

**Files:**
- Create: `src/features/transactions/components/TransactionList.tsx`

- [ ] **Créer la liste avec filtres**

```typescript
// src/features/transactions/components/TransactionList.tsx

import type { Transaction, TransactionCategory, TransactionTag, TransactionFilter } from '../types/transaction.types'
import { CATEGORY_LABELS } from '../utils/transactionCalculations'
import TransactionCard from './TransactionCard'

interface TransactionListProps {
  transactions: Transaction[]
  filter: TransactionFilter
  onFilterChange: (filter: TransactionFilter) => void
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const date = new Date()
  date.setMonth(date.getMonth() - i)
  const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  const label = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
  return { value, label }
})

export default function TransactionList({
  transactions,
  filter,
  onFilterChange,
  onEdit,
  onDelete,
}: TransactionListProps) {
  const total = transactions.reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3 flex-wrap">
        <select
          value={filter.month}
          onChange={e => onFilterChange({ ...filter, month: e.target.value })}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          {MONTHS.map(m => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>

        <select
          value={filter.category}
          onChange={e => onFilterChange({ ...filter, category: e.target.value as TransactionCategory | 'all' })}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <option value="all">Toutes catégories</option>
          {(Object.keys(CATEGORY_LABELS) as TransactionCategory[]).map(cat => (
            <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
          ))}
        </select>

        <select
          value={filter.tag}
          onChange={e => onFilterChange({ ...filter, tag: e.target.value as TransactionTag | 'all' })}
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          <option value="all">Tous les tags</option>
          <option value="fixed">Fixe</option>
          <option value="variable">Variable</option>
          <option value="leisure">Loisir</option>
        </select>
      </div>

      {transactions.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-8">Aucune dépense pour cette période.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {transactions.map(t => (
            <TransactionCard key={t.id} transaction={t} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}

      {transactions.length > 0 && (
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <span className="text-sm font-semibold text-slate-800">Total : {total.toFixed(2)}€</span>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Commit**

```bash
git add src/features/transactions/components/TransactionList.tsx
git commit -m "feat: add TransactionList component with filters"
```

---

## Task 10 : `TransactionCategoryChart`

**Files:**
- Create: `src/features/transactions/components/TransactionCategoryChart.tsx`

- [ ] **Créer le donut chart**

```typescript
// src/features/transactions/components/TransactionCategoryChart.tsx

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { TransactionCategory } from '../types/transaction.types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../utils/transactionCalculations'

interface TransactionCategoryChartProps {
  categoryTotals: Record<TransactionCategory, number>
}

export default function TransactionCategoryChart({ categoryTotals }: TransactionCategoryChartProps) {
  const data = (Object.entries(categoryTotals) as [TransactionCategory, number][])
    .filter(([, value]) => value > 0)
    .map(([category, value]) => ({
      name: CATEGORY_LABELS[category],
      value,
      color: CATEGORY_COLORS[category],
    }))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-400">
        Aucune donnée à afficher
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          dataKey="value"
          paddingAngle={3}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [`${value.toFixed(2)}€`, '']}
        />
        <Legend
          formatter={(value) => <span className="text-xs text-slate-600">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
```

- [ ] **Commit**

```bash
git add src/features/transactions/components/TransactionCategoryChart.tsx
git commit -m "feat: add TransactionCategoryChart donut chart"
```

---

## Task 11 : `TransactionsPage`

**Files:**
- Create: `src/pages/TransactionsPage.tsx`

- [ ] **Créer la page**

```typescript
// src/pages/TransactionsPage.tsx

import { useState } from 'react'
import { useTransactions } from '../features/transactions/hooks/useTransactions'
import TransactionCategoryChart from '../features/transactions/components/TransactionCategoryChart'
import TransactionList from '../features/transactions/components/TransactionList'
import TransactionForm from '../features/transactions/components/TransactionForm'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import type { Transaction } from '../features/transactions/types/transaction.types'

export default function TransactionsPage() {
  const {
    filtered,
    categoryTotals,
    totalCurrentMonth,
    filter,
    setFilter,
    add,
    update,
    remove,
  } = useTransactions()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>(undefined)

  const handleOpenAdd = () => {
    setEditingTransaction(undefined)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setIsModalOpen(true)
  }

  const handleSubmit = (data: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (editingTransaction) {
      update({ ...editingTransaction, ...data })
    } else {
      add(data)
    }
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Dépenses</h1>
          <p className="text-sm text-slate-500 mt-1">Suivi de vos dépenses réelles</p>
        </div>
        <Button onClick={handleOpenAdd}>+ Ajouter</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <h2 className="font-semibold text-slate-800 mb-4">Répartition par catégorie</h2>
          <TransactionCategoryChart categoryTotals={categoryTotals} />
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-center gap-4">
          <div>
            <p className="text-sm text-slate-500">Total ce mois</p>
            <p className="text-3xl font-semibold text-slate-800 mt-1">{totalCurrentMonth.toFixed(2)}€</p>
          </div>
          <div>
            <p className="text-sm text-slate-500">Dépenses filtrées</p>
            <p className="text-xl font-semibold text-slate-700 mt-1">{filtered.length} transaction{filtered.length > 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-semibold text-slate-800 mb-4">Liste des dépenses</h2>
        <TransactionList
          transactions={filtered}
          filter={filter}
          onFilterChange={setFilter}
          onEdit={handleOpenEdit}
          onDelete={remove}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTransaction ? 'Modifier la dépense' : 'Ajouter une dépense'}
      >
        <TransactionForm
          initial={editingTransaction}
          onSubmit={handleSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  )
}
```

- [ ] **Commit**

```bash
git add src/pages/TransactionsPage.tsx
git commit -m "feat: add TransactionsPage"
```

---

## Task 12 : Router + Navigation

**Files:**
- Modify: `src/router/index.tsx`
- Modify: `src/components/ui/SideBarMenu.tsx`

- [ ] **Ajouter la route dans `src/router/index.tsx`**

```typescript
import { createBrowserRouter } from 'react-router-dom'
import BudgetPage from '../pages/BudgetPage'
import DashboardPage from '../pages/DashboardPage'
import GoalsPage from '../pages/GoalsPage'
import SettingsPage from '../pages/SettingsPage'
import TransactionsPage from '../pages/TransactionsPage'
import Layout from '../components/ui/Layout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'goals', element: <GoalsPage /> },
      { path: 'budget', element: <BudgetPage /> },
      { path: 'transactions', element: <TransactionsPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])
```

- [ ] **Ajouter le lien dans `src/components/ui/SideBarMenu.tsx`**

Remplacer le tableau `navItems` :

```typescript
import { LayoutDashboard, Target, Wallet, Receipt, Settings } from 'lucide-react'

const navItems = [
  { to: '/',             label: 'Dashboard',   icon: LayoutDashboard },
  { to: '/goals',        label: 'Objectifs',   icon: Target },
  { to: '/budget',       label: 'Budget',      icon: Wallet },
  { to: '/transactions', label: 'Dépenses',    icon: Receipt },
  { to: '/settings',     label: 'Paramètres',  icon: Settings },
]
```

- [ ] **Commit**

```bash
git add src/router/index.tsx src/components/ui/SideBarMenu.tsx
git commit -m "feat: add /transactions route and sidebar link"
```

---

## Task 13 : Widget Dashboard

**Files:**
- Modify: `src/features/dashboard/components/GlobalProgress.tsx`

- [ ] **Ajouter le widget "Dépenses du mois" dans GlobalProgress**

Ajouter en bas du composant `GlobalProgress`, après le bloc des objectifs, le widget suivant. Ajouter les imports nécessaires en haut :

```typescript
import { Link } from 'react-router-dom'
import { useTransactions } from '../../transactions/hooks/useTransactions'
import TransactionCategoryChart from '../../transactions/components/TransactionCategoryChart'
```

Ajouter dans le corps du composant, sous la ligne `const { goals } = useGoals()` :

```typescript
const { categoryTotals, totalCurrentMonth, filtered } = useTransactions()

const top3 = (Object.entries(categoryTotals) as [string, number][])
  .sort(([, a], [, b]) => b - a)
  .slice(0, 3)
```

Ajouter le widget JSX à la fin du return, après le bloc goals :

```tsx
<div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
  <div className="flex items-center justify-between mb-4">
    <h2 className="font-semibold text-slate-800">Dépenses du mois</h2>
    <Link to="/transactions" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
      Voir tout →
    </Link>
  </div>
  <div className="grid grid-cols-2 gap-4">
    <div>
      <TransactionCategoryChart categoryTotals={categoryTotals} />
    </div>
    <div className="flex flex-col justify-center gap-3">
      <div>
        <p className="text-xs text-slate-500">Total ce mois</p>
        <p className="text-xl font-semibold text-slate-800">{totalCurrentMonth.toFixed(2)}€</p>
      </div>
      {top3.length > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-slate-500 mb-1">Top catégories</p>
          {top3.map(([name, value]) => (
            <div key={name} className="flex justify-between text-xs">
              <span className="text-slate-600">{name}</span>
              <span className="font-medium text-slate-800">{(value as number).toFixed(2)}€</span>
            </div>
          ))}
        </div>
      )}
      {filtered.length === 0 && (
        <p className="text-xs text-slate-400">Aucune dépense ce mois</p>
      )}
    </div>
  </div>
</div>
```

- [ ] **Commit**

```bash
git add src/features/dashboard/components/GlobalProgress.tsx
git commit -m "feat: add transactions widget to Dashboard"
```

---

## Task 14 : Vérification finale

- [ ] **Lancer le projet**

```bash
npm run dev
```

- [ ] **Vérifier dans le navigateur**

1. La sidebar affiche bien "Dépenses" entre Budget et Paramètres
2. La page `/transactions` charge sans erreur
3. Ajouter une transaction via le bouton "+ Ajouter" → elle apparaît dans la liste
4. Le donut chart se met à jour après ajout
5. Les filtres (mois, catégorie, tag) fonctionnent
6. Éditer une transaction → les valeurs sont pré-remplies dans le form
7. Supprimer une transaction → elle disparaît
8. Recharger la page → les données persistent (localStorage)
9. Le Dashboard affiche le widget "Dépenses du mois" avec le donut et le top 3

- [ ] **Vérifier TypeScript**

```bash
npm run build
```

Expected: aucune erreur TypeScript.

- [ ] **Commit final si tout est clean**

```bash
git add -A
git commit -m "feat: transactions feature complete"
```
