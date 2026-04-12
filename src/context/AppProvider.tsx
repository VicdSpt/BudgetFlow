import { useReducer, useEffect } from "react"
import AppContext from "./AppContext"
import { appReducer } from "./AppReducer"
import { AppState } from "../types/common.type"

const initialState: AppState = {
    goals: [],
    budget: {
        income: 0,
        spendingList: []
    }
}

export function AppProvider({children}: {children: React.ReactNode}){
    const [state, dispatch] = useReducer(appReducer, initialState)

    useEffect(() => {
        localStorage.setItem("budgetflow_goals", JSON.stringify(state.goals))
        localStorage.setItem("budgetflow_budget", JSON.stringify(state.budget))
    }, [state])

    return (
        <AppContext.Provider value={{state, dispatch}}>
            {children}
        </AppContext.Provider>
    )
}