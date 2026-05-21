import GlobalProgress from "../features/dashboard/components/GlobalProgress"
import SavingsChart from "../features/dashboard/components/SavingsChart"
import InfoTooltip from "../components/ui/InfoTooltip"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-slate-800">Dashboard</h1>
            <InfoTooltip text="Vue d'ensemble de votre situation financière : revenus, dépenses fixes, progression des objectifs et dépenses réelles du mois." />
          </div>
          <p className="text-sm text-slate-500 mt-1">Vue d'ensemble de votre épargne</p>
        </div>
      </div>
      <GlobalProgress />
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
        <h2 className="font-semibold text-slate-800 mb-4">Épargne par objectif</h2>
        <SavingsChart />
      </div>
    </div>
  )
}