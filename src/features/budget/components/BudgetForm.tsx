import { useState } from "react"
import { useBudget } from "../hooks/useBudget"
import Input from "../../../components/ui/Input"
import Button from "../../../components/ui/Button"

export default function BudgetForm() {
    const { setIncome, addExpense, budget, resetExpenses, resetIncome } = useBudget()
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
        <div className="flex flex-col gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h2 className="font-semibold text-slate-800 mb-4">Revenu mensuel</h2>
                <form onSubmit={handleIncomeSubmit} className="flex gap-3 items-end">
                    <div className="flex-1">
                        <Input label="Montant (€)" type="number" value={income} onChange={(event) => setIncomeValue(parseFloat(event.target.value))} />
                    </div>
                    <Button type="submit" variant="primary">Enregistrer</Button>
                    <Button type="button" variant="danger" onClick={() => {resetIncome(); setIncomeValue(0)}}>Reset</Button>
                </form>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h2 className="font-semibold text-slate-800 mb-4">Ajouter une dépense fixe</h2>
                <form onSubmit={handleExpenseSubmit} className="flex flex-col gap-3">
                    <Input label="Nom de la dépense" type="text" value={expenseForm.name} onChange={(event) => setExpenseForm({ ...expenseForm, name: event.target.value })} />
                    <div className="flex gap-3 items-end">
                        <div className="flex-1">
                            <Input label="Montant (€)" type="number" value={expenseForm.amount} onChange={(event) => setExpenseForm({...expenseForm, amount: parseFloat(event.target.value)})}/>
                        </div>
                        <Button type="submit" variant="success">Ajouter</Button>
                        <Button type="button" variant="danger" onClick={resetExpenses}>Reset</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}