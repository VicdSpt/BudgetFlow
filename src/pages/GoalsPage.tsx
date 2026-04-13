import { useState } from "react"
import GoalForm from "../features/goals/components/GoalForm"
import GoalList from "../features/goals/components/GoalList"
import Modal from "../components/ui/Modal"
import Button from "../components/ui/Button"

export default function GoalsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div>
      <div>
        <h1>Mes Objectifs</h1>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>+ Ajouter un Objectif</Button>
      </div>

      <GoalList />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouvel Objectif">
        <GoalForm onClose={() => setIsModalOpen(false)}/>
      </Modal>
    </div>
  )
}