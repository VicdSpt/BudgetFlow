import { useAppContext } from "../../../context/AppContext";
import type { Goal } from "../types/goal.type";

export function useGoals(){
    const {state, dispatch} = useAppContext();

    const addGoal = (goal: Omit<Goal, "id">) => {
        dispatch({ type: "ADD_GOAL", payload: goal });
    }

    const updateGoal = (goal: Goal) => {
        dispatch({ type: "UPDATE_GOAL", payload: goal });
    }

    const deleteGoal = (id: string) => {
        dispatch({ type: "DELETE_GOAL", payload: id });
    }

    return {goals: state.goals, addGoal, updateGoal, deleteGoal};
}