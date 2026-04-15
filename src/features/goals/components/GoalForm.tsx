import { useState } from "react";
import type { GoalStatus } from "../types/goal.type";
import { useGoals } from "../hooks/useGoals";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import type { Goal } from "../types/goal.type";

interface GoalFormProps {
    onClose: () => void,
    goal?: Goal
}

export default function GoalForm({ onClose, goal }: GoalFormProps) {
    const { addGoal, updateGoal } = useGoals()

    const [formData, setFormData] = useState({
        name: goal?.name ?? "",
        targetSavings: goal?.targetSavings ?? 0,
        currentSavings: goal?.currentSavings ?? 0,
        deadlineDate: goal?.deadlineDate ?? "",
        status: goal?.status ?? "active" as GoalStatus,
        description: goal?.description ?? ""
    })

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        if(goal){
            updateGoal({...formData, id: goal.id})
        } else {
            addGoal(formData)
        }
        setFormData({
            name: "",
            targetSavings: 0,
            currentSavings: 0,
            deadlineDate: "",
            status: "active" as GoalStatus,
            description: ""
        })
        onClose()
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Nom de l'objectif" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value})} />
            <Input label="Description" value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value})} />
            <div className="grid grid-cols-2 gap-4">
                <Input label="Montant cible (€)" type="number" value={formData.targetSavings} onChange={(event) => setFormData({ ...formData, targetSavings: parseFloat(event.target.value)})} />
                <Input label="Épargne actuelle (€)" type="number" value={formData.currentSavings} onChange={(event) => setFormData({ ...formData, currentSavings: parseFloat(event.target.value)})} />
            </div>
            <Input label="Date limite" type="date" value={formData.deadlineDate} onChange={(event) => setFormData({ ...formData, deadlineDate: event.target.value})} />
            <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={onClose}>Annuler</Button>
                <Button type="submit" variant="primary">{goal ? "Modifier" : "Ajouter"}</Button>
            </div>
        </form>
    )
}