import { useState } from "react";
import type { GoalStatus } from "../types/goal.type";
import { useGoals } from "../hooks/useGoals";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";

interface GoalFormProps {
    onClose: () => void
}

export default function GoalForm({ onClose }: GoalFormProps) {
    const { addGoal } = useGoals()

    const [formData, setFormData] = useState({
        name: "",
        targetSavings: 0,
        currentSavings: 0,
        deadlineDate: "",
        status: "active" as GoalStatus,
        description: ""
    })

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        addGoal(formData)
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
        <form onSubmit={handleSubmit}>

            <Input label="Nom" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value})} />

            <Input label="Montant Cible" type="number" value={formData.targetSavings} onChange={(event) => setFormData({ ...formData, targetSavings: parseFloat(event.target.value)})} />

            <Input label="Economies" type="number" value={formData.currentSavings} onChange={(event) => setFormData({ ...formData, currentSavings: parseFloat(event.target.value)})} />

            <Input label="Deadline" type="date" value={formData.deadlineDate} onChange={(event) => setFormData({ ...formData, deadlineDate: event.target.value})} />

            <Input label="Status" value={formData.status} onChange={(event) => setFormData({ ...formData, status: event.target.value as GoalStatus})} />

            <Input label="Description" value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value})} />
            
            <Button type="submit" variant="primary">Ajouter</Button>

        </form>
    )
}