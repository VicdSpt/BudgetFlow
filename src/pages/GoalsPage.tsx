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
    <div>
      <div>
        <h1>Mes Objectifs</h1>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Ajouter un Objectif</Button>
      </div>

      <GoalList onEdit={handleEdit} />

      <Modal isOpen={isModalOpen} onClose={handleClose} title="Nouvel Objectif">
        <GoalForm goal={editingGoal ?? undefined} onClose={() => setIsModalOpen(false)}/>
      </Modal>
    </div>
  )
}