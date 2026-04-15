import { useState } from "react"
import GoalForm from "../features/goals/components/GoalForm"
import GoalList from "../features/goals/components/GoalList"
import Modal from "../components/ui/Modal"
import Button from "../components/ui/Button"
import type { Goal } from "../features/goals/types/goal.type"

export default function GoalsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  const handleEdit = (goal: Goal) =>{
    setEditingGoal(goal)
    setIsModalOpen(true)
  }

  const handleClose = () =>{
    setEditingGoal(null)
    setIsModalOpen(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Mes Objectifs</h1>
          <p className="text-sm text-slate-500 mt-1">Suivez votre progression vers vos objectifs d'épargne</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Ajouter</Button>
      </div>

      <GoalList onEdit={handleEdit} />

      <Modal isOpen={isModalOpen} onClose={handleClose} title={editingGoal ? "Modifier l'objectif" : "Nouvel objectif"}>
        <GoalForm goal={editingGoal ?? undefined} onClose={handleClose} />
      </Modal>
    </div>
  )

}