import { useState } from "react";
import type { GoalStatus } from "../types/goal.type";
import { useGoals } from "../hooks/useGoals";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { Form } from "react-router-dom";

interface GoalFormProps{
    onClose: () => void
}

export default function GoalForm({onClose}: GoalFormProps) {
    const {addGoal} = useGoals()

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
    }
    
  return (
    <Form></Form>
  )
}