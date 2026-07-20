import type { Goal } from "../features/goals/types/goal.type"
import type { FixedExpense, MonthlyIncome } from "../features/budget/types/budget.type"
import type { Transaction } from "../features/transactions/types/transaction.type"

// ---- Goals ----
export interface GoalRow {
  id: string
  user_id: string
  name: string
  description: string
  target_savings: number
  current_savings: number
  deadline_date: string | null
  status: string
}

export function goalToRow(goal: Goal, userId: string): GoalRow {
  return {
    id: goal.id,
    user_id: userId,
    name: goal.name,
    description: goal.description,
    target_savings: goal.targetSavings,
    current_savings: goal.currentSavings,
    deadline_date: goal.deadlineDate || null,
    status: goal.status,
  }
}

export function rowToGoal(row: GoalRow): Goal {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    targetSavings: row.target_savings,
    currentSavings: row.current_savings,
    deadlineDate: row.deadline_date ?? undefined,
    status: row.status as Goal["status"],
  }
}

// ---- Fixed expenses ----
export interface ExpenseRow {
  id: string
  user_id: string
  name: string
  amount: number
  frequency: string
  category: string
  payment_day: number | null
}

export function expenseToRow(expense: FixedExpense, userId: string): ExpenseRow {
  return {
    id: expense.id,
    user_id: userId,
    name: expense.name,
    amount: expense.amount,
    frequency: expense.frequency,
    category: expense.category,
    payment_day: expense.paymentDay ?? null,
  }
}

export function rowToExpense(row: ExpenseRow): FixedExpense {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount,
    frequency: row.frequency as FixedExpense["frequency"],
    category: row.category as FixedExpense["category"],
    paymentDay: row.payment_day ?? undefined,
  }
}

// ---- Monthly incomes ----
export interface IncomeRow {
  user_id: string
  month: string
  income: number
}

export function incomeToRow(income: MonthlyIncome, userId: string): IncomeRow {
  return { user_id: userId, month: income.month, income: income.income }
}

export function rowToIncome(row: IncomeRow): MonthlyIncome {
  return { month: row.month, income: row.income }
}

// ---- Transactions ----
export interface TransactionRow {
  id: string
  user_id: string
  amount: number
  category: string
  description: string
  date: string
  tag: string
  created_at: string
}

export function transactionToRow(t: Transaction, userId: string): TransactionRow {
  return {
    id: t.id,
    user_id: userId,
    amount: t.amount,
    category: t.category,
    description: t.description,
    date: t.date,
    tag: t.tag,
    created_at: t.createdAt,
  }
}

export function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    amount: row.amount,
    category: row.category as Transaction["category"],
    description: row.description,
    date: row.date,
    tag: row.tag as Transaction["tag"],
    createdAt: row.created_at,
  }
}
