import { useAppContext } from "../../../context/AppContext"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

export default function SavingsChart() {
    const { state } = useAppContext()

    const data = state.goals.map(goal => ({
        name: goal.name,
        épargné: goal.currentSavings,
        objectif: goal.targetSavings,
    }))

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="épargné" fill="#3b82f6" />
                <Bar dataKey="objectif" fill="#e5e7eb" />
            </BarChart>
        </ResponsiveContainer>
    )
}