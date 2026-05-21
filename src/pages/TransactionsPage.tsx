import { useState } from 'react'
import { useTransactions } from '../features/transactions/hooks/useTransaction'
import TransactionCategoryChart from '../features/transactions/components/TransactionCategoryChart'
import TransactionList from '../features/transactions/components/TransactionList'
import TransactionForm from '../features/transactions/components/TransactionForm'
import Modal from '../components/ui/Modal'
import Button from '../components/ui/Button'
import InfoTooltip from '../components/ui/InfoTooltip'
import type { Transaction } from '../features/transactions/types/transaction.type'

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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-slate-800">Dépenses</h1>
            <InfoTooltip text="Enregistrez vos dépenses réelles du quotidien (courses, transport, loisirs…) et visualisez leur répartition par catégorie sous forme de graphique." />
          </div>
          <p className="text-sm text-slate-500 mt-1">Suivi de vos dépenses réelles</p>
        </div>
        <Button onClick={handleOpenAdd} variant="primary">+ Ajouter</Button>
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
            <p className="text-sm text-slate-500">Transactions filtrées</p>
            <p className="text-xl font-semibold text-slate-700 mt-1">
              {filtered.length} transaction{filtered.length > 1 ? 's' : ''}
            </p>
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
