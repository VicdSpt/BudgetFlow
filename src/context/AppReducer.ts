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

        default:
            return state
    }
}