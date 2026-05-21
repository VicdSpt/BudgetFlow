import BudgetForm from "../features/budget/components/BudgetForm"
import BudgetSummary from "../features/budget/components/BudgetSummary"
import BudgetChart from "../features/budget/components/BudgetChart"
import BudgetMonthlyView from "../features/budget/components/BudgetMonthlyView"
import InfoTooltip from "../components/ui/InfoTooltip"

export default function BudgetPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-slate-800">Budget</h1>
          <InfoTooltip text="Planifiez votre budget mensuel : saisissez vos revenus et vos dépenses fixes récurrentes (loyer, abonnements…) pour connaître ce qu'il vous reste disponible." />
        </div>
        <p className="text-sm text-slate-500 mt-1">Gérez vos revenus et dépenses fixes mensuelles</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <BudgetForm />
        <BudgetSummary />
      </div>
      <BudgetChart />
      <BudgetMonthlyView />
    </div>
  )
}
