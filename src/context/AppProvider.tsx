import { useReducer, useEffect, useCallback, useState, useRef } from "react"
import AppContext from "./AppContext"
import { appReducer } from "./AppReducer"
import { useAuth } from "./AuthContext"
import { syncToSupabase } from "../lib/syncToSupabase"
import { fetchUserData } from "../lib/fetchUserData"
import ConfirmDialog from "../components/ui/ConfirmDialog"
import { goalToRow, expenseToRow, incomeToRow, transactionToRow } from "../lib/mappers"
import { supabase } from "../lib/supabase"
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
    const [showMigrationPrompt, setShowMigrationPrompt] = useState(false)

    // true when the current state reflects live guest localStorage data
    // (false while an account is loaded — prevents the write effect from
    //  clobbering guest localStorage with account data during logout)
    const isGuestStateLive = useRef(true)

    // Dispatch enrichi : mutation locale immédiate + écriture cloud si connecté
    const syncDispatch = useCallback((action: AppAction) => {
        dispatch(action)
        if (session) syncToSupabase(action, session.user.id)
    }, [session])

    // localStorage : uniquement en mode invité (connecté, la vérité est dans Supabase)
    // Guard uses the ref so that on logout the write is skipped until hydration
    // has restored guest data and flipped the flag back to true.
    useEffect(() => {
        if (session || !isGuestStateLive.current) return
        localStorage.setItem("budgetflow_goals", JSON.stringify(state.goals))
        localStorage.setItem("budgetflow_budget", JSON.stringify(state.budget))
        localStorage.setItem("budgetflow_transactions", JSON.stringify(state.transactions))
    }, [state, session])

    // Hydratation : connexion → données du compte ; déconnexion → retour aux données invité
    // Keyed on userId (not session object) so TOKEN_REFRESHED events don't re-trigger hydration.
    const userId = session?.user.id
    useEffect(() => {
        let cancelled = false

        const hydrate = (data: AppState) => {
            if (cancelled) return
            dispatch({ type: "HYDRATE_GOALS", payload: data.goals })
            dispatch({ type: "HYDRATE_BUDGET", payload: data.budget })
            dispatch({ type: "HYDRATE_TRANSACTIONS", payload: data.transactions })
        }

        if (userId) {
            // Mark account data as active before the async fetch so the write
            // effect doesn't persist stale state to guest localStorage.
            isGuestStateLive.current = false
            Promise.resolve()
                .then(() => { if (!cancelled) setIsSyncLoading(true) })
                .then(() => fetchUserData())
                .then(data => {
                    const accountIsEmpty =
                        data.goals.length === 0 &&
                        data.transactions.length === 0 &&
                        data.budget.monthlyIncomes.length === 0 &&
                        data.budget.spendingList.length === 0
                    const guest = getGuestState()
                    const guestHasData =
                        guest.goals.length > 0 ||
                        guest.transactions.length > 0 ||
                        guest.budget.monthlyIncomes.length > 0 ||
                        guest.budget.spendingList.length > 0

                    hydrate(data)
                    if (!cancelled && accountIsEmpty && guestHasData) setShowMigrationPrompt(true)
                })
                .catch(err => console.error("[sync] chargement du compte échoué :", err))
                .finally(() => { if (!cancelled) setIsSyncLoading(false) })
        } else {
            hydrate(getGuestState())
            isGuestStateLive.current = true
        }

        return () => { cancelled = true }
    }, [userId])

    const clearGuestStorage = () => {
        localStorage.removeItem("budgetflow_goals")
        localStorage.removeItem("budgetflow_budget")
        localStorage.removeItem("budgetflow_transactions")
    }

    const acceptMigration = async () => {
        if (!session) return
        const guest = getGuestState()
        const userId = session.user.id
        const results = await Promise.all([
            guest.goals.length > 0
                ? supabase.from("goals").insert(guest.goals.map(g => goalToRow(g, userId)))
                : Promise.resolve(),
            guest.budget.spendingList.length > 0
                ? supabase.from("fixed_expenses").insert(guest.budget.spendingList.map(e => expenseToRow(e, userId)))
                : Promise.resolve(),
            guest.budget.monthlyIncomes.length > 0
                ? supabase.from("monthly_incomes").insert(guest.budget.monthlyIncomes.map(i => incomeToRow(i, userId)))
                : Promise.resolve(),
            guest.transactions.length > 0
                ? supabase.from("transactions").insert(guest.transactions.map(t => transactionToRow(t, userId)))
                : Promise.resolve(),
        ])
        const hasError = results.some(r => r && typeof r === "object" && "error" in r && r.error)
        if (hasError) {
            console.error("[migration] échec de l'import — données locales conservées")
            alert("L'import a échoué. Vos données locales sont conservées — réessayez plus tard.")
            setShowMigrationPrompt(false)
            return
        }
        clearGuestStorage()
        dispatch({ type: "HYDRATE_GOALS", payload: guest.goals })
        dispatch({ type: "HYDRATE_BUDGET", payload: guest.budget })
        dispatch({ type: "HYDRATE_TRANSACTIONS", payload: guest.transactions })
        setShowMigrationPrompt(false)
    }

    return (
        <AppContext.Provider value={{ state, dispatch: syncDispatch, isSyncLoading }}>
            {children}
            <ConfirmDialog
                isOpen={showMigrationPrompt}
                title="Importer vos données locales ?"
                message="Votre compte est vide mais cet appareil contient des données (objectifs, budget, dépenses). Voulez-vous les importer dans votre compte ?"
                confirmLabel="Importer"
                onConfirm={acceptMigration}
                onCancel={() => setShowMigrationPrompt(false)}
            />
        </AppContext.Provider>
    )
}
