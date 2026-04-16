import { useState } from "react"
import { useBudget } from "../hooks/useBudget"
import Input from "../../../components/ui/Input"
import Button from "../../../components/ui/Button"

export default function BudgetForm() {
    const { setIncome, addExpense, budget, resetExpenses, resetIncome } = useBudget()
    const [income, setIncomeValue] = useState(budget.income)
    const [expenseForm, setExpenseForm] = useState({ name: "", amount: 0, frequency: "monthly" })

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
        <div className="flex flex-col gap-6 h-full">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex-1">
                <h2 className="font-semibold text-slate-800 mb-4">Revenu mensuel</h2>
                <form onSubmit={handleIncomeSubmit} className="flex flex-col gap-3">
                    <Input label="Montant (€): " type="number" value={income}
                        onChange={(e) => setIncomeValue(parseFloat(e.target.value))} />
                    <div className="flex gap-2">
                        <Button type="submit" variant="primary">Enregistrer</Button>
                        <Button type="button" variant="danger" onClick={() => { resetIncome(); setIncomeValue(0) }}>Reset</Button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex-1">
                <h2 className="font-semibold text-slate-800 mb-4">Ajouter une dépense fixe</h2>
                <form onSubmit={handleExpenseSubmit} className="flex flex-col gap-3">
                    <Input label="Nom de la dépense: " type="text" value={expenseForm.name}
                        onChange={(e) => setExpenseForm({ ...expenseForm, name: e.target.value })} />
                    <Input label="Montant (€): " type="number" value={expenseForm.amount}
                        onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) })} />
                    <select value={expenseForm.frequency} onChange={(event) => setExpenseForm({ ...expenseForm, frequency: event.target.value })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                        <option value="daily">Journalier</option>
                        <option value="weekly">Hebdomadaire</option>
                        <option value="monthly">Mensuel</option>
                        <option value="quarterly">Trimestriel</option>
                        <option value="semesterly">Semestriel</option>
                        <option value="yearly">Annuel</option>
                    </select>
                    <div className="flex gap-2">
                        <Button type="submit" variant="primary">Ajouter</Button>
                        <Button type="button" variant="danger" onClick={resetExpenses}>Reset dépenses</Button>
                    </div>
                </form>
            </div>
        </div>
    )

}