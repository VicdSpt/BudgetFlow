import { useBudget } from "../hooks/useBudget";
import Button from "../../../components/ui/Button";
import { X } from 'lucide-react';

export default function BudgetSummary() {
    const { budget, availableBudget, deleteExpense } = useBudget()

    const colorsCodeExpenses = {
        daily: { label: "Quotidien", color: "bg-blue-100 text-blue-600" },
        weekly: { label: "Hebdo", color: "bg-orange-100 text-orange-600" },
        monthly: { label: "Mensuel", color: "bg-red-100 text-red-600" },
        quarterly: { label: "Trimestriel", color: "bg-violet-100 text-violet-600" },
        semesterly: { label: "Semestriel", color: "bg-cyan-100 text-cyan-600" },
        yearly: { label: "Annuel", color: "bg-emerald-100 text-emerald-600" },
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
            <h2 className="font-semibold text-slate-800">Résumé</h2>

            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">Revenus mensuels</span>
                <span className="font-medium text-slate-800">{budget.income}€</span>
            </div>

            <div className="flex flex-col gap-2">
                {budget.spendingList.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-2">Aucune dépense fixe</p>
                ) : (
                    budget.spendingList.map(expense => {
                        const colorsExpensesConfig = colorsCodeExpenses[expense.frequency] ?? { label: "Mensuel", color: "bg-blue-100 text-blue-600" }
                        return (
                            <div key={expense.id} className="grid grid-cols-[1fr_120px_100px_32px] textcen items-center gap-3 py-1.5">
                                <span className="text-sm text-slate-600">{expense.name}</span>
                                <span className={`text-xs text-center font-medium px-2 py-0.5 rounded-full ${colorsExpensesConfig.color}`}>
                                    {colorsExpensesConfig.label}
                                </span>
                                <span className="text-sm font-medium text-rose-500 text-right">-{expense.amount}€</span>

                                <Button variant="ghost" onClick={() => deleteExpense(expense.id)}>
                                    <X size={14} />
                                </Button>
                            </div>

                        )
                    })
                )}
            </div>

            <div className="flex justify-between items-center py-2 border-t border-slate-100">
                <span className="text-sm font-medium text-slate-700">Disponible</span>
                <span className={`font-semibold text-lg ${availableBudget >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                    {availableBudget.toFixed(2)}€
                </span>
            </div>
        </div>
    )
}