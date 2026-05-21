import { useState } from 'react'
import type { Transaction, TransactionCategory, TransactionTag } from '../types/transaction.type'
import { CATEGORY_LABELS } from '../utils/transactionCalculation'
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
  'one-time': 'Ponctuel',
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
      <Input
        label="Montant (€)"
        type="number"
        min="0"
        step="0.01"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="0.00"
        required
      />

      <Input
        label="Description"
        type="text"
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Ex: Courses Carrefour"
        required
      />

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-600">Catégorie</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value as TransactionCategory)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          {(Object.keys(CATEGORY_LABELS) as TransactionCategory[]).map(cat => (
            <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-600">Tag</label>
        <select
          value={tag}
          onChange={e => setTag(e.target.value as TransactionTag)}
          className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          {(Object.keys(TAG_LABELS) as TransactionTag[]).map(t => (
            <option key={t} value={t}>{TAG_LABELS[t]}</option>
          ))}
        </select>
      </div>

      <Input
        label="Date"
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        required
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" variant="primary">
          {initial ? 'Mettre à jour' : 'Ajouter'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  )
}
