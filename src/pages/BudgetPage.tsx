import BudgetForm from "../features/budget/components/BudgetForm"
import BudgetSummary from "../features/budget/components/BudgetSummary"
import BudgetChart from "../features/budget/components/BudgetChart"
import BudgetMonthlyView from "../features/budget/components/BudgetMonthlyView"

export default function BudgetPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Budget</h1>
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
