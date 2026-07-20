import { supabase } from "./supabase"
import { goalToRow, expenseToRow, incomeToRow, transactionToRow } from "./mappers"
import type { AppAction } from "../types/common.type"

// Reflète chaque action mutation vers Supabase (fire-and-forget, optimistic UI).
// v1 : pas de rollback en cas d'échec — on log et on notifie.
export function syncToSupabase(action: AppAction, userId: string): void {
  const report = (op: string) => (result: { error: { message: string } | null }) => {
    if (result.error) {
      console.error(`[sync] ${op} a échoué :`, result.error.message)
    }
  }

  switch (action.type) {
    case "ADD_GOAL":
      supabase.from("goals").insert(goalToRow(action.payload, userId)).then(report("ADD_GOAL"))
      break
    case "UPDATE_GOAL":
      supabase.from("goals").update(goalToRow(action.payload, userId)).eq("id", action.payload.id).then(report("UPDATE_GOAL"))
      break
    case "DELETE_GOAL":
      supabase.from("goals").delete().eq("id", action.payload).then(report("DELETE_GOAL"))
      break

    case "ADD_EXPENSE":
      supabase.from("fixed_expenses").insert(expenseToRow(action.payload, userId)).then(report("ADD_EXPENSE"))
      break
    case "UPDATE_EXPENSE":
      supabase.from("fixed_expenses").update(expenseToRow(action.payload, userId)).eq("id", action.payload.id).then(report("UPDATE_EXPENSE"))
      break
    case "DELETE_EXPENSE":
      supabase.from("fixed_expenses").delete().eq("id", action.payload).then(report("DELETE_EXPENSE"))
      break

    case "SET_MONTHLY_INCOME":
      supabase.from("monthly_incomes").upsert(incomeToRow(action.payload, userId)).then(report("SET_MONTHLY_INCOME"))
      break
    case "RESET_INCOME":
      supabase.from("monthly_incomes").delete().eq("user_id", userId).then(report("RESET_INCOME"))
      break
    case "RESET_EXPENSES":
      supabase.from("fixed_expenses").delete().eq("user_id", userId).then(report("RESET_EXPENSES"))
      break

    case "ADD_TRANSACTION":
      supabase.from("transactions").insert(transactionToRow(action.payload, userId)).then(report("ADD_TRANSACTION"))
      break
    case "UPDATE_TRANSACTION":
      supabase.from("transactions").update(transactionToRow(action.payload, userId)).eq("id", action.payload.id).then(report("UPDATE_TRANSACTION"))
      break
    case "DELETE_TRANSACTION":
      supabase.from("transactions").delete().eq("id", action.payload).then(report("DELETE_TRANSACTION"))
      break

    // HYDRATE_* : flux entrant uniquement, jamais synchronisé vers le cloud
    default:
      break
  }
}
