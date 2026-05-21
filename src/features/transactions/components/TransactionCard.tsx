import type { Transaction } from '../types/transaction.type'
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../utils/transactionCalculation'

interface TransactionCardProps {
  transaction: Transaction
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}

const TAG_LABELS = { fixed: 'Fixe', variable: 'Variable', 'one-time': 'Ponctuel' }

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
