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
    <div className="flex flex-col gap-6">
        <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-sm text-slate-500">Revenus</p>
                <p className="text-2xl font-semibold text-slate-800 mt-1">{state.budget.income}€</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-sm text-slate-500">Dépenses fixes</p>
                <p className="text-2xl font-semibold text-rose-500 mt-1">-{totalExpenses}€</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-sm text-slate-500">Disponible</p>
                <p className={`text-2xl font-semibold mt-1 ${available >= 0 ? "text-emerald-600" : "text-rose-500"}`}>{available.toFixed(2)}€</p>
            </div>
        </div>

        {state.goals.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <h2 className="font-semibold text-slate-800 mb-4">Progression des objectifs</h2>
                <div className="flex flex-col gap-4">
                    {state.goals.map(goal => (
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
    </div>
  )
}