import { useBudget } from "../hooks/useBudget";
import Button from "../../../components/ui/Button";
import { X } from 'lucide-react';


export default function BudgetSummary() {
    const {budget, availableBudget, deleteExpense} = useBudget()

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
                budget.spendingList.map(expense => (
                    <div key={expense.id} className="flex items-center justify-between py-1.5">
                        <span className="text-sm text-slate-600">{expense.name}</span>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-rose-500">-{expense.amount}€</span>
                            <Button variant="ghost" onClick={() => deleteExpense(expense.id)}>
                                <X size={14} />
                            </Button>
                        </div>
                    </div>
                ))
            )}
        </div>

        <div className="flex justify-between items-center py-2 border-t border-slate-100">
            <span className="text-sm font-medium text-slate-700">Disponible</span>
            <span className={`font-semibold text-lg ${availableBudget >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                {availableBudget}€
            </span>
        </div>
    </div>
  )
}