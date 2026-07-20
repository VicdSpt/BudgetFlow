import { useState } from "react"
import { Sparkles, RotateCcw } from "lucide-react"
import GlobalProgress from "../features/dashboard/components/GlobalProgress"
import SavingsChart from "../features/dashboard/components/SavingsChart"
import InfoTooltip from "../components/ui/InfoTooltip"
import Button from "../components/ui/Button"
import ConfirmDialog from "../components/ui/ConfirmDialog"
import { useAppContext } from "../context/AppContext"
import { buildDemoData } from "../utils/demoData"

export default function DashboardPage() {
  const { state, dispatch } = useAppContext()
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false)

  const isAppEmpty =
    state.goals.length === 0 &&
    state.transactions.length === 0 &&
    state.budget.monthlyIncomes.length === 0 &&
    state.budget.spendingList.length === 0

  const loadDemoData = () => {
    const demo = buildDemoData()
    dispatch({ type: "HYDRATE_GOALS", payload: demo.goals })
    dispatch({ type: "HYDRATE_BUDGET", payload: demo.budget })
    dispatch({ type: "HYDRATE_TRANSACTIONS", payload: demo.transactions })
  }

  const resetAll = () => {
    dispatch({ type: "HYDRATE_GOALS", payload: [] })
    dispatch({ type: "HYDRATE_BUDGET", payload: { monthlyIncomes: [], spendingList: [] } })
    dispatch({ type: "HYDRATE_TRANSACTIONS", payload: [] })
    setIsResetConfirmOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
            <InfoTooltip text="Vue d'ensemble de votre situation financière : revenus, dépenses fixes, progression des objectifs et dépenses réelles du mois." />
          </div>
          <p className="text-sm text-slate-500 mt-1">Vue d'ensemble de votre épargne</p>
        </div>
        {!isAppEmpty && (
          <Button variant="secondary" onClick={() => setIsResetConfirmOpen(true)}>
            <span className="flex items-center gap-1.5">
              <RotateCcw size={14} />
              Réinitialiser
            </span>
          </Button>
        )}
      </div>

      {isAppEmpty && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <Sparkles size={20} className="text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-800">Bienvenue sur BudgetFlow !</p>
              <p className="text-sm text-slate-500 mt-0.5">L'application est vide. Chargez des données de démonstration pour découvrir toutes les fonctionnalités.</p>
            </div>
          </div>
          <Button variant="primary" onClick={loadDemoData}>Charger la démo</Button>
        </div>
      )}

      <GlobalProgress />
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-semibold text-slate-800 mb-4">Épargne par objectif</h2>
        <SavingsChart />
      </div>

      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Tout réinitialiser"
        message="Tous vos objectifs, votre budget et vos dépenses seront définitivement supprimés. Pensez à exporter vos données (Paramètres) si vous voulez les conserver."
        confirmLabel="Tout supprimer"
        onConfirm={resetAll}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  )
}
