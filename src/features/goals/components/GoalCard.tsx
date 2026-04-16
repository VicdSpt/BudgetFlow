import type { Goal } from "../types/goal.type"
import ProgressBar from "../../../components/ui/ProgressBar"
import { percentageComplete, monthsToGoal } from "../utils/goalCalculation"
import Button from "../../../components/ui/Button"

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  autoContribution: number;
}

export default function GoalCard({ goal, onEdit, onDelete, autoContribution }: GoalCardProps) {
  const percent = percentageComplete(goal.currentSavings, goal.targetSavings)
  const contribution = goal.monthlyContribution || autoContribution
  const months = contribution ? monthsToGoal(goal.currentSavings, goal.targetSavings, contribution) : null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-800">{goal.name}</h3>
          {goal.description && (
            <p className="text-sm text-slate-400 mt-0.5">{goal.description}</p>
          )}
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700">
          {goal.status}
        </span>
      </div>

      <div>
        <div className="flex justify-between text-sm text-slate-500 mb-2">
          <span>{goal.currentSavings}€ épargnés</span>
          <span>objectif: {goal.targetSavings}€</span>
        </div>
        <ProgressBar value={percent} />
      </div>

      {goal.monthlyContribution > 0 && (
        <p className="text-xs text-slate-500">{goal.monthlyContribution}€/mois</p>
      )}


      {goal.deadlineDate && (
        <p className="text-xs text-slate-400">Échéance: {goal.deadlineDate}</p>
      )}

      {months !== null && (
        <p className="text-xs text-slate-500">{months} mois restants</p>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => onEdit(goal)}>Modifier</Button>
        <Button variant="danger" onClick={() => onDelete(goal.id)}>Supprimer</Button>
      </div>
    </div>
  )
}