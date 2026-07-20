import { supabase } from "./supabase"
import { rowToGoal, rowToExpense, rowToIncome, rowToTransaction } from "./mappers"
import type { GoalRow, ExpenseRow, IncomeRow, TransactionRow } from "./mappers"
import type { AppState } from "../types/common.type"

// Charge toutes les données du compte (RLS filtre automatiquement par user_id)
export async function fetchUserData(): Promise<AppState> {
  const [goalsRes, expensesRes, incomesRes, transactionsRes] = await Promise.all([
    supabase.from("goals").select("*"),
    supabase.from("fixed_expenses").select("*"),
    supabase.from("monthly_incomes").select("*"),
    supabase.from("transactions").select("*"),
  ])

  const firstError = goalsRes.error ?? expensesRes.error ?? incomesRes.error ?? transactionsRes.error
  if (firstError) throw new Error(firstError.message)

  return {
    goals: ((goalsRes.data ?? []) as GoalRow[]).map(rowToGoal),
    budget: {
      spendingList: ((expensesRes.data ?? []) as ExpenseRow[]).map(rowToExpense),
      monthlyIncomes: ((incomesRes.data ?? []) as IncomeRow[]).map(rowToIncome),
    },
    transactions: ((transactionsRes.data ?? []) as TransactionRow[]).map(rowToTransaction),
  }
}
