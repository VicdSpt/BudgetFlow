import { useState } from "react";
import { useGoals } from "../hooks/useGoals";
import GoalCard from "./GoalCard";
import ConfirmDialog from "../../../components/ui/ConfirmDialog";
import type { Goal } from "../types/goal.type";

interface GoalListProps{
    onEdit: (goal: Goal) => void
}
export default function GoalList({onEdit}: GoalListProps) {
    const { goals, deleteGoal } = useGoals()
    const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

    const pendingGoal = goals.find(g => g.id === pendingDeleteId)

    const confirmDelete = () => {
        if (pendingDeleteId) deleteGoal(pendingDeleteId)
        setPendingDeleteId(null)
    }

    if (goals.length === 0) return (
        <div className="text-center py-16 text-slate-400">
            <p className="text-lg">Aucun objectif pour le moment</p>
            <p className="text-sm mt-1">Ajoutez votre premier objectif d'épargne</p>
        </div>
    )

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {goals.map(goal => (
                    <GoalCard key={goal.id}
                        goal={goal}
                        onEdit={onEdit}
                        onDelete={setPendingDeleteId}
                    />
                ))}
            </div>

            <ConfirmDialog
                isOpen={pendingDeleteId !== null}
                title="Supprimer l'objectif"
                message={`Supprimer « ${pendingGoal?.name ?? ""} » ? Cette action est irréversible.`}
                onConfirm={confirmDelete}
                onCancel={() => setPendingDeleteId(null)}
            />
        </>
    )
}
