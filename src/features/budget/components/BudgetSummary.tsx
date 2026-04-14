import { useBudget } from "../hooks/useBudget";
import Button from "../../../components/ui/Button";
import { X } from 'lucide-react';


export default function BudgetSummary() {
    const {budget, availableBudget, deleteExpense} = useBudget()

  return (
    <div>
        <p>Revenus: {budget.income}</p>
        <div>
            {budget.spendingList.map(expense => (
                <div key={expense.id}>
                    <span>{expense.name}</span>
                    <span>{expense.amount}</span>
                    <Button variant="danger" onClick={() => deleteExpense(expense.id)}><X size={24}/></Button>
                </div>
            ))}
        </div>
        <p>Disponible: {availableBudget}</p>
    </div>
  )
}