import BudgetForm from "../features/budget/components/BudgetForm"
import BudgetSummary from "../features/budget/components/BudgetSummary"

export default function BudgetPage() {
  return (
    <div>
      <h1>Budget</h1>
      <div>
        <div>
          <BudgetForm/>
          <BudgetSummary/>
        </div>
      </div>
    </div>
  )
}