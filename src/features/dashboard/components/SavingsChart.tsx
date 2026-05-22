import { useAppContext } from "../../../context/AppContext"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface TooltipProps {
    active?: boolean
    payload?: { name: string; value: number; color: string }[]
    label?: string
}

function CustomTooltip({ active, payload, label }: TooltipProps) {
    if (!active || !payload?.length) return null

    return (
        <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg">
            <p className="font-semibold mb-1">{label}</p>
            {payload.map(entry => (
                <p key={entry.name} style={{ color: entry.color }}>
                    {entry.name} : {entry.value} €
                </p>
            ))}
        </div>
    )
}

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
                <Tooltip cursor={false} content={<CustomTooltip />} />
                <Bar dataKey="épargné" fill="#3b82f6" />
                <Bar dataKey="objectif" fill="#93c5fd" />
            </BarChart>
        </ResponsiveContainer>
    )
}