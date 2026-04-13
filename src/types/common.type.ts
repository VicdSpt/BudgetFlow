import type { Goal } from "../features/goals/types/goal.type";
import type { GlobalBudget } from "../features/budget/types/budget.type"

export type StorageKey = "budgetflow_goals" | "budgetflow_budget";

export type AppState = {
    goals: Goal[];
    budget: GlobalBudget;
}
export type AppAction =
  | { type: 'ADD_GOAL'; payload: Omit<Goal, "id"> }
  | { type: 'DELETE_GOAL'; payload: string }
  | { type: 'UPDATE_GOAL'; payload: Goal }
  | { type: 'HYDRATE_GOALS'; payload: Goal[] }
  | { type: 'HYDRATE_BUDGET'; payload: GlobalBudget }
