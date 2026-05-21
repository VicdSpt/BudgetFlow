import type { Transaction, TransactionCategory, TransactionFilter } from '../types/transaction.type'

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
