import { useGoals } from "../hooks/useGoals";
import GoalCard from "./GoalCard";

export default function GoalList() {
    const { goals, deleteGoal } = useGoals()

    return (
        <div>
            {goals.map(goal => (
                <GoalCard key={goal.id}
                    goal={goal}
                    onEdit={() => { }}
                    onDelete={deleteGoal}
                />
            ))}
        </div>
    )
}