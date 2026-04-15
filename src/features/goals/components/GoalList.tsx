import { useGoals } from "../hooks/useGoals";
import GoalCard from "./GoalCard";
import type { Goal } from "../types/goal.type";

interface GoalListProps{
    onEdit: (goal: Goal) => void
}
export default function GoalList({onEdit}: GoalListProps) {
    const { goals, deleteGoal } = useGoals()

    return (
        <div>
            {goals.map(goal => (
                <GoalCard key={goal.id}
                    goal={goal}
                    onEdit={onEdit}
                    onDelete={deleteGoal}
                />
            ))}
        </div>
    )
}