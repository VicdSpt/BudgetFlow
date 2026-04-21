import type { Goal } from "../types/goal.type"
import ProgressBar from "../../../components/ui/ProgressBar"
import { percentageComplete, suggestedMonthlyContribution, monthsUntilDeadline } from "../utils/goalCalculation"
import Button from "../../../components/ui/Button"

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}

export default function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const percent = percentageComplete(goal.currentSavings, goal.targetSavings)
  const suggested = goal.deadlineDate ? suggestedMonthlyContribution(goal.currentSavings, goal.targetSavings, goal.deadlineDate) : null
  const months = goal.deadlineDate ? monthsUntilDeadline(goal.deadlineDate) : null

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

      {goal.deadlineDate && (
        <p className="text-xs text-slate-400">Échéance: {goal.deadlineDate}</p>
      )}

      {suggested !== null && suggested > 0 && (
        <div className="flex flex-col gap-1">
          <p className="text-xs text-slate-500">
            <span className="font-medium text-emerald-600">{suggested}€/mois</span> à épargner
          </p>
          <p className="text-xs text-slate-400">{months} mois restants</p>
        </div>
      )}

      {!goal.deadlineDate && (
        <p className="text-xs text-amber-500">Ajoute une date limite pour voir l'estimation</p>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={() => onEdit(goal)}>Modifier</Button>
        <Button variant="danger" onClick={() => onDelete(goal.id)}>Supprimer</Button>
      </div>
    </div>
  )
}
