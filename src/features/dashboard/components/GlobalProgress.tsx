import { Link } from "react-router-dom"
import { useBudget } from "../../budget/hooks/useBudget"
import ProgressBar from "../../../components/ui/ProgressBar"
import { percentageComplete } from "../../goals/utils/goalCalculation"
import { useGoals } from "../../goals/hooks/useGoals"
import { useTransactions } from "../../transactions/hooks/useTransaction"
import TransactionCategoryChart from "../../transactions/components/TransactionCategoryChart"
import { CATEGORY_LABELS } from "../../transactions/utils/transactionCalculation"

export default function GlobalProgress() {
    const { currentIncome, totalMonthlyExpenses, availableBudget } = useBudget()
    const { goals } = useGoals()
    const { categoryTotals, totalCurrentMonth } = useTransactions()

    const top3 = (Object.entries(categoryTotals) as [string, number][])
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <p className="text-sm text-slate-500">Revenus ce mois</p>
                    <p className="text-2xl font-semibold text-slate-800 mt-1">{currentIncome > 0 ? `${currentIncome}€` : "—"}</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <p className="text-sm text-slate-500">Dépenses fixes</p>
                    <p className="text-2xl font-semibold text-rose-500 mt-1">{totalMonthlyExpenses > 0 ? "-" : ""}{totalMonthlyExpenses.toFixed(2)}€</p>
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <p className="text-sm text-slate-500">Disponible</p>
                    <p className={`text-2xl font-semibold mt-1 ${availableBudget >= 0 ? "text-emerald-600" : "text-rose-500"}`}>{availableBudget.toFixed(2)}€</p>
                </div>
            </div>

            {goals.length > 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h2 className="font-semibold text-slate-800 mb-4">Progression des objectifs</h2>
                    <div className="flex flex-col gap-4">
                        {goals.map(goal => (
                            <div key={goal.id}>
                                <div className="flex justify-between text-sm text-slate-500 mb-1">
                                    <span>{goal.name}</span>
                                    <span>{goal.currentSavings}€ / {goal.targetSavings}€</span>
                                </div>
                                <ProgressBar value={percentageComplete(goal.currentSavings, goal.targetSavings)} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-slate-800">Dépenses du mois</h2>
                    <Link to="/transactions" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium">
                        Voir tout →
                    </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <TransactionCategoryChart categoryTotals={categoryTotals} />
                    <div className="flex flex-col justify-center gap-3">
                        <div>
                            <p className="text-xs text-slate-500">Total ce mois</p>
                            <p className="text-xl font-semibold text-slate-800">{totalCurrentMonth.toFixed(2)}€</p>
                        </div>
                        {top3.length > 0 ? (
                            <div className="flex flex-col gap-1">
                                <p className="text-xs text-slate-500 mb-1">Top catégories</p>
                                {top3.map(([key, value]) => (
                                    <div key={key} className="flex justify-between text-xs">
                                        <span className="text-slate-600">{CATEGORY_LABELS[key as keyof typeof CATEGORY_LABELS] ?? key}</span>
                                        <span className="font-medium text-slate-800">{(value as number).toFixed(2)}€</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400">Aucune dépense ce mois</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
