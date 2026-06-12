import type { Transaction, TransactionCategory, TransactionTag, TransactionFilter } from '../types/transaction.type'
import { CATEGORY_LABELS } from '../utils/transactionCalculation'
import TransactionCard from './TransactionCard'

interface TransactionListProps {
  transactions: Transaction[]
  filter: TransactionFilter
  onFilterChange: (filter: TransactionFilter) => void
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

const MONTHS = Array.from({ length: 12 }, (_, i) => {
  const now = new Date()
  // jour fixé à 1 : évite le débordement de fin de mois (ex: 31 juillet - 1 mois → "31 juin" → 1er juillet)
  const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
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
          <option value="one-time">Ponctuel</option>
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
