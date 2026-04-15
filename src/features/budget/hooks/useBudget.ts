import { useAppContext } from "../../../context/AppContext";
import type { FixedExpense } from "../types/budget.type";

export function useBudget() {
  const { state, dispatch } = useAppContext();
  const resetIncome = () => dispatch({ type: "RESET_INCOME" });
  const resetExpenses = () => dispatch({ type: "RESET_EXPENSES" });

  const setIncome = (amount: number) => {
    dispatch({ type: "SET_INCOME", payload: amount });
  };

  const addExpense = (expense: Omit<FixedExpense, "id">) => {
    dispatch({ type: "ADD_EXPENSE", payload: expense });
  };

  const deleteExpense = (id: string) => {
    dispatch({ type: "DELETE_EXPENSE", payload: id });
  };

  const availableBudget =
    state.budget.income -
    state.budget.spendingList.reduce((sum, expense) => sum + expense.amount, 0);

  return {
    budget: state.budget,
    setIncome,
    addExpense,
    deleteExpense,
    resetExpenses,
    resetIncome,
    availableBudget,
  };
}
