import { useState } from "react"
import { useBudget } from "../hooks/useBudget"
import Input from "../../../components/ui/Input"
import Button from "../../../components/ui/Button"

export default function BudgetForm() {
    const { setIncome, addExpense, budget } = useBudget()
    const [income, setIncomeValue] = useState(budget.income)
    const [expenseForm, setExpenseForm] = useState({ name: "", amount: 0 })

    const handleIncomeSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setIncome(income);
    }

    const handleExpenseSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        addExpense(expenseForm);
        setExpenseForm({ name: "", amount: 0 });
    }

    return (
        <div>
            <form onSubmit={handleIncomeSubmit}>
                <Input label="Revenu Mensuel" type="number" value={income} onChange={(event) => setIncomeValue(parseFloat(event.target.value))} />
                <Button type="submit" variant="primary">Enregistrer</Button>
            </form>

            <form onSubmit={handleExpenseSubmit}>
                <Input label="Nom de la dépense" type="text" value={expenseForm.name} onChange={(event) => setExpenseForm({ ...expenseForm, name: event.target.value })} />

                <Input label="Montant" type="number" value={expenseForm.amount} onChange={(event) => setExpenseForm({...expenseForm, amount: parseFloat(event.target.value)})}/>

                <Button type="submit" variant="success">Ajouter dépenses</Button>
            </form>
        </div>
    )
}