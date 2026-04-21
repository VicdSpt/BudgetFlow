import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useBudget } from "../hooks/useBudget"

const COLORS = ["#f43f5e", "#10b981", "#94a3b8"]

export default function BudgetChart() {
    const { budget, availableBudget } = useBudget()

    const totalExpenses = budget.income - availableBudget

    if (budget.income === 0) return null

    const data = [
        { name: "Dépenses", value: parseFloat(totalExpenses.toFixed(2)) },
        { name: "Disponible", value: parseFloat(Math.max(availableBudget, 0).toFixed(2)) },
    ]

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 outline-none">
            <h2 className="font-semibold text-slate-800 mb-4">Répartition du budget</h2>
            <ResponsiveContainer width="100%" height={220}>
                <PieChart style={{ outline: "none" }}>
                    <Pie data={data} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value" stroke="none">
                        {data.map((_, index) => (
                            <Cell key={index} fill={COLORS[index]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${value}€`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
