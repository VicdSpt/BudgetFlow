import type { Goal } from '../features/goals/types/goal.type'
import type {
  FixedExpense,
  GlobalBudget,
  MonthlyIncome,
} from '../features/budget/types/budget.type'
import type { Transaction, TransactionAction } from '../features/transactions/types/transaction.type'

export type StorageKey = 'budgetflow_goals' | 'budgetflow_budget' | 'budgetflow_transactions'

export type AppState = {
  goals: Goal[]
  budget: GlobalBudget
  transactions: Transaction[]
}

export type AppAction =
  | { type: 'ADD_GOAL'; payload: Goal }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'HYDRATE_GOALS'; payload: Goal[] }
  | { type: 'HYDRATE_BUDGET'; payload: GlobalBudget }
  | { type: 'HYDRATE_TRANSACTIONS'; payload: Transaction[] }
  | { type: 'SET_MONTHLY_INCOME'; payload: MonthlyIncome }
  | { type: 'ADD_EXPENSE'; payload: FixedExpense }
  | { type: 'UPDATE_EXPENSE'; payload: FixedExpense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'RESET_INCOME' }
  | { type: 'RESET_EXPENSES' }
  | TransactionAction
