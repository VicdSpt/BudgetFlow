// src/features/transactions/types/transaction.types.ts

export type TransactionCategory =
  | 'food'
  | 'transport'
  | 'housing'
  | 'health'
  | 'leisure'
  | 'tech'
  | 'other'

export type TransactionTag = 'fixed' | 'variable' | 'one-time'

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
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'UPDATE_TRANSACTION'; payload: Transaction }
  | { type: 'DELETE_TRANSACTION'; payload: string }
