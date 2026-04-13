import type { Goal } from "../types/goal.type"
import ProgressBar from "../../../components/ui/ProgressBar"
import { percentageComplete } from "../utils/goalCalculation"
import Button from "../../../components/ui/Button"

interface GoalCardProps{
    goal: Goal;
    onEdit: (goal: Goal) => void;
    onDelete: (id: string) => void
}

export default function GoalCard({goal, onEdit, onDelete}: GoalCardProps) {
  return (
    <div>
        <div>{goal.name}</div>
        <div>
            <p>{goal.currentSavings} / {goal.targetSavings}</p>
            <ProgressBar value={percentageComplete(goal.currentSavings, goal.targetSavings)} />
        </div>
        <div>
            <Button variant="success" onClick={() => onEdit(goal)}>Edit</Button>
            <Button variant="danger" onClick={() => onDelete(goal.id)}>Delete</Button>
        </div>
    </div>
  )
}