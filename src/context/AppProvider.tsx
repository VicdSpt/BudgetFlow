import { useReducer, useEffect, useCallback } from "react"
import AppContext from "./AppContext"
import { appReducer } from "./AppReducer"
import { useAuth } from "./AuthContext"
import { syncToSupabase } from "../lib/syncToSupabase"
import type { AppState, AppAction } from "../types/common.type"

const emptyBudget = { monthlyIncomes: [], spendingList: [] }

const getGuestState = (): AppState => {
  try {
    const savedGoals = localStorage.getItem("budgetflow_goals")
    const savedBudget = localStorage.getItem("budgetflow_budget")
    const savedTransactions = localStorage.getItem("budgetflow_transactions")
    return {
      goals: savedGoals ? JSON.parse(savedGoals) : [],
      budget: savedBudget ? JSON.parse(savedBudget) : emptyBudget,
      transactions: savedTransactions ? JSON.parse(savedTransactions) : [],
    }
  } catch {
    return { goals: [], budget: emptyBudget, transactions: [] }
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
    const { session } = useAuth()
    const [state, dispatch] = useReducer(appReducer, getGuestState())

    // Dispatch enrichi : mutation locale immédiate + écriture cloud si connecté
    const syncDispatch = useCallback((action: AppAction) => {
        dispatch(action)
        if (session) syncToSupabase(action, session.user.id)
    }, [session])

    // localStorage : uniquement en mode invité (connecté, la vérité est dans Supabase)
    useEffect(() => {
        if (session) return
        localStorage.setItem("budgetflow_goals", JSON.stringify(state.goals))
        localStorage.setItem("budgetflow_budget", JSON.stringify(state.budget))
        localStorage.setItem("budgetflow_transactions", JSON.stringify(state.transactions))
    }, [state, session])

    return (
        <AppContext.Provider value={{ state, dispatch: syncDispatch }}>
            {children}
        </AppContext.Provider>
    )
}
