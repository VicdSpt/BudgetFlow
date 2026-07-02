import { useMemo, useState } from 'react'
import { useAppContext } from '../../../context/AppContext'
import {
  filterTransactions,
  totalByCategory,
  totalForMonth,
} from '../utils/transactionCalculation'
import { getCurrentMonth } from '../../../utils/dateUtils'
import type { Transaction, TransactionFilter } from '../types/transaction.type'

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
