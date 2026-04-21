import { useAppContext } from "../../../context/AppContext";
import type { FixedExpense } from "../types/budget.type";
import { monthlyAmount } from "../utils/BudgetCalculation";

export function useBudget() {
  const { state, dispatch } = useAppContext();

  const currentMonth = new Date().toISOString().slice(0, 7) // "YYYY-MM"

  const currentMonthEntry = state.budget.monthlyIncomes.find(m => m.month === currentMonth)
  const currentIncome = currentMonthEntry?.income ?? 0

  const setMonthlyIncome = (month: string, income: number) => {
    dispatch({ type: "SET_MONTHLY_INCOME", payload: { month, income } });
  };

  const addExpense = (expense: Omit<FixedExpense, "id">) => {
    dispatch({ type: "ADD_EXPENSE", payload: expense });
  };

  const updateExpense = (expense: FixedExpense) => {
    dispatch({ type: "UPDATE_EXPENSE", payload: expense });
  };

  const deleteExpense = (id: string) => {
    dispatch({ type: "DELETE_EXPENSE", payload: id });
  };

  const resetIncome = () => dispatch({ type: "RESET_INCOME" });
  const resetExpenses = () => dispatch({ type: "RESET_EXPENSES" });

  const totalMonthlyExpenses = state.budget.spendingList.reduce(
    (sum, expense) => sum + monthlyAmount(expense), 0
  );

  const availableBudget = currentIncome - totalMonthlyExpenses;

  return {
    budget: state.budget,
    currentMonth,
    currentIncome,
    setMonthlyIncome,
    addExpense,
    updateExpense,
    deleteExpense,
    resetExpenses,
    resetIncome,
    availableBudget,
    totalMonthlyExpenses,
  };
}
