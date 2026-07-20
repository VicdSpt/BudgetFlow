import { useReducer, useEffect, useCallback, useState } from "react"
import AppContext from "./AppContext"
import { appReducer } from "./AppReducer"
import { useAuth } from "./AuthContext"
import { syncToSupabase } from "../lib/syncToSupabase"
import { fetchUserData } from "../lib/fetchUserData"
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
    const [isSyncLoading, setIsSyncLoading] = useState(false)

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

    // Hydratation : connexion → données du compte ; déconnexion → retour aux données invité
    useEffect(() => {
        let cancelled = false

        const hydrate = (data: AppState) => {
            if (cancelled) return
            dispatch({ type: "HYDRATE_GOALS", payload: data.goals })
            dispatch({ type: "HYDRATE_BUDGET", payload: data.budget })
            dispatch({ type: "HYDRATE_TRANSACTIONS", payload: data.transactions })
        }

        if (session) {
            Promise.resolve()
                .then(() => { if (!cancelled) setIsSyncLoading(true) })
                .then(() => fetchUserData())
                .then(hydrate)
                .catch(err => console.error("[sync] chargement du compte échoué :", err))
                .finally(() => { if (!cancelled) setIsSyncLoading(false) })
        } else {
            hydrate(getGuestState())
        }

        return () => { cancelled = true }
    }, [session])

    return (
        <AppContext.Provider value={{ state, dispatch: syncDispatch, isSyncLoading }}>
            {children}
        </AppContext.Provider>
    )
}
