import type { Goal, GoalStatus } from "../types/goal.type"
import { percentageComplete, suggestedMonthlyContribution, monthsUntilDeadline } from "../utils/goalCalculation"
import { formatMonth } from "../../budget/utils/BudgetCalculation"
import Button from "../../../components/ui/Button"

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
}

const statusConfig: Record<GoalStatus, { label: string; className: string }> = {
  active:    { label: "Actif",     className: "bg-emerald-50 text-emerald-700" },
  paused:    { label: "En pause",  className: "bg-amber-50 text-amber-600" },
  completed: { label: "Terminé",   className: "bg-blue-50 text-blue-600" },
}

export default function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const percent = percentageComplete(goal.currentSavings, goal.targetSavings)
  const suggested = goal.deadlineDate ? suggestedMonthlyContribution(goal.currentSavings, goal.targetSavings, goal.deadlineDate) : null
  const months = goal.deadlineDate ? monthsUntilDeadline(goal.deadlineDate) : null
  const status = statusConfig[goal.status]

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-slate-800 leading-tight">{goal.name}</h3>
          {goal.description && (
            <p className="text-sm text-slate-400 mt-1">{goal.description}</p>
          )}
        </div>
        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${status.className}`}>
          {status.label}
        </span>
      </div>

      {/* Montants */}
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-slate-800">{goal.currentSavings.toLocaleString("fr-FR")}€</span>
        <span className="text-sm text-slate-400 mb-1">sur {goal.targetSavings.toLocaleString("fr-FR")}€</span>
      </div>

      {/* Barre de progression */}
      <div>
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-500">Progression</span>
          <span className="font-semibold text-emerald-600">{percent}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Estimation mensuelle */}
      {suggested !== null && suggested > 0 && (
        <div className="bg-emerald-50 rounded-xl p-3 flex flex-col gap-1">
          <p className="text-sm text-slate-600">
            Épargne recommandée : <span className="font-bold text-emerald-700 text-base">{suggested}€/mois</span>
          </p>
          <p className="text-xs text-slate-400">{months} mois restants</p>
        </div>
      )}

      {!goal.deadlineDate && (
        <p className="text-xs text-amber-500">Ajoute une date limite pour voir l'estimation mensuelle</p>
      )}

      {/* Footer : date + boutons */}
      <div className="flex items-center justify-between pt-1">
        {goal.deadlineDate
          ? <p className="text-xs text-slate-400">Échéance : <span className="font-medium">{formatMonth(goal.deadlineDate)}</span></p>
          : <span />
        }
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => onEdit(goal)}>Modifier</Button>
          <Button variant="danger" onClick={() => onDelete(goal.id)}>Supprimer</Button>
        </div>
      </div>

    </div>
  )
}
