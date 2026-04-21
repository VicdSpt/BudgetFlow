import { useState } from "react"
import { useBudget } from "../hooks/useBudget"
import Input from "../../../components/ui/input"
import Button from "../../../components/ui/Button"
import type { ExpenseFrequency, ExpenseCategory } from "../types/budget.type"
import { formatMonth } from "../utils/BudgetCalculation"

export default function BudgetForm() {
    const { setMonthlyIncome, addExpense, resetExpenses, resetIncome, currentMonth, currentIncome } = useBudget()
    const [income, setIncomeValue] = useState(String(currentIncome || ""))
    const [expenseForm, setExpenseForm] = useState<{ name: string; amount: string; frequency: ExpenseFrequency; category: ExpenseCategory }>({
        name: "", amount: "", frequency: "monthly", category: "autre"
    })

    const handleIncomeSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        setMonthlyIncome(currentMonth, parseFloat(income.replace(",", ".")) || 0);
    }

    const handleExpenseSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        addExpense({ ...expenseForm, amount: parseFloat(expenseForm.amount.replace(",", ".")) || 0 });
        setExpenseForm({ name: "", amount: "", frequency: "monthly", category: "autre" });
    }

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex-1">
                <h2 className="font-semibold text-slate-800 mb-1">Revenu mensuel</h2>
                <p className="text-xs text-slate-400 mb-4">{formatMonth(currentMonth)}</p>
                <form onSubmit={handleIncomeSubmit} className="flex flex-col gap-3">
                    <Input label="Montant (€)" type="text" inputMode="decimal" value={income}
                        onChange={(event) => setIncomeValue(event.target.value)} />
                    <div className="flex gap-2">
                        <Button type="submit" variant="primary">Enregistrer</Button>
                        <Button type="button" variant="danger" onClick={() => { resetIncome(); setIncomeValue("") }}>Reset</Button>
                    </div>
                </form>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex-1">
                <h2 className="font-semibold text-slate-800 mb-4">Ajouter une dépense fixe</h2>
                <form onSubmit={handleExpenseSubmit} className="flex flex-col gap-3">
                    <Input label="Nom" type="text" value={expenseForm.name}
                        onChange={(e) => setExpenseForm({ ...expenseForm, name: e.target.value })} />
                    <Input label="Montant (€)" type="text" inputMode="decimal" value={expenseForm.amount}
                        onChange={(event) => setExpenseForm({ ...expenseForm, amount: event.target.value })} />
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-600">Fréquence</label>
                            <select value={expenseForm.frequency} onChange={(event) => setExpenseForm({ ...expenseForm, frequency: event.target.value as ExpenseFrequency })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                                <option value="daily">Journalier</option>
                                <option value="weekly">Hebdomadaire</option>
                                <option value="monthly">Mensuel</option>
                                <option value="quarterly">Trimestriel</option>
                                <option value="semesterly">Semestriel</option>
                                <option value="yearly">Annuel</option>
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-slate-600">Catégorie</label>
                            <select value={expenseForm.category} onChange={(event) => setExpenseForm({ ...expenseForm, category: event.target.value as ExpenseCategory })} className="w-full px-3 py-2 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                                <option value="logement">🏠 Logement</option>
                                <option value="transport">🚗 Transport</option>
                                <option value="investissement">💵 Investissements</option>
                                <option value="alimentation">🛒 Alimentation</option>
                                <option value="abonnements">📱 Abonnements</option>
                                <option value="sante">💊 Santé</option>
                                <option value="loisirs">🎮 Loisirs</option>
                                <option value="autre">📦 Autre</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button type="submit" variant="primary">Ajouter</Button>
                        <Button type="button" variant="danger" onClick={resetExpenses}>Reset dépenses</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
