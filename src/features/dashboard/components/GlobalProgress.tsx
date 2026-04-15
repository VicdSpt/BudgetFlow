import { useAppContext } from "../../../context/AppContext"
import ProgressBar from "../../../components/ui/ProgressBar"
import { percentageComplete } from "../../goals/utils/goalCalculation"

export default function GlobalProgress() {
    const {state} = useAppContext()

    const totalExpenses = state.budget.spendingList.reduce(
        (sum, expense) => sum + expense.amount, 0
    )

    const available = state.budget.income - totalExpenses

  return (
    <div>
        <p>Revenus: {state.budget.income}</p>
        <p>Dépenses: {totalExpenses}</p>
        <p>Disponible: {available}</p>
    </div>
  )
}