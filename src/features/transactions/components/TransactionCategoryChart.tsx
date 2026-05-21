import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import type { TransactionCategory } from '../types/transaction.type'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../utils/transactionCalculation'

interface TransactionCategoryChartProps {
  categoryTotals: Record<TransactionCategory, number>
}

export default function TransactionCategoryChart({ categoryTotals }: TransactionCategoryChartProps) {
  const data = (Object.entries(categoryTotals) as [TransactionCategory, number][])
    .filter(([, value]) => value > 0)
    .map(([category, value]) => ({
      name: CATEGORY_LABELS[category],
      value,
      color: CATEGORY_COLORS[category],
    }))

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-sm text-slate-400">
        Aucune donnée à afficher
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          dataKey="value"
          paddingAngle={3}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => [`${value.toFixed(2)}€`, '']} />
        <Legend formatter={(value) => <span className="text-xs text-slate-600">{value}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}
