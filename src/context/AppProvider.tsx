import { useReducer, useEffect } from "react"
import AppContext from "./AppContext"
import { appReducer } from "./AppReducer"
import type { AppState } from "../types/common.type"

const emptyBudget = { monthlyIncomes: [], spendingList: [] }

const getInitialState = (): AppState => {
  try {
    const savedGoals = localStorage.getItem("budgetflow_goals")
    const savedBudget = localStorage.getItem("budgetflow_budget")
    return {
      goals: savedGoals ? JSON.parse(savedGoals) : [],
      budget: savedBudget ? JSON.parse(savedBudget) : emptyBudget
    }
  } catch {
    return { goals: [], budget: emptyBudget }
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(appReducer, getInitialState())

    useEffect(() => {
        localStorage.setItem("budgetflow_goals", JSON.stringify(state.goals))
        localStorage.setItem("budgetflow_budget", JSON.stringify(state.budget))
    }, [state])

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    )
}
