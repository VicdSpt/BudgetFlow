import { Goal } from "../features/goals/types/goal.type";
import { GlobalBudget } from "../features/budget/types/budget.type"

export type StorageKey = "budgetflow_goals" | "budgetflow_budget";
export type AppState = {
    goals: Goal[];
    budget: GlobalBudget;
}
export type AppAction = never