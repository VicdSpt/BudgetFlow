import type { AppState, AppAction } from "../types/common.type";

export function appReducer(state: AppState, action: AppAction): AppState {

    switch (action.type) {
        case "ADD_GOAL":
            return { ...state, goals: [...state.goals, { ...action.payload, id: crypto.randomUUID() }] }

        case "DELETE_GOAL":
            return { ...state, goals: state.goals.filter(goal => goal.id !== action.payload) }

        case "UPDATE_GOAL":
            return { ...state, goals: state.goals.map(goal => goal.id === action.payload.id ? action.payload : goal) }
        
        case "HYDRATE_GOALS":
            return { ...state, goals: action.payload }
        
        case "HYDRATE_BUDGET":
            return { ...state, budget: action.payload }

        case "SET_INCOME":
            return { ...state, budget: { ...state.budget, income: action.payload } }
        
        case "ADD_EXPENSE":
            return { ...state, budget: { ...state.budget, spendingList: [...state.budget.spendingList, { ...action.payload, id: crypto.randomUUID() }] } }
        
        case "UPDATE_EXPENSE":
            return { ...state, budget: { ...state.budget, spendingList: state.budget.spendingList.map(e => e.id === action.payload.id ? action.payload : e) } }

        case "DELETE_EXPENSE":
            return { ...state, budget: { ...state.budget, spendingList: state.budget.spendingList.filter(expense => expense.id !== action.payload) } }
        
        case "RESET_INCOME":
            return {...state, budget: {...state.budget, income: 0}}

        case "RESET_EXPENSES":
            return {...state, budget: {...state.budget, spendingList: []}}
        default:
            return state
    }
}