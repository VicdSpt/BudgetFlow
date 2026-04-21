import { useState } from "react"
import { useBudget } from "../hooks/useBudget"
import { expenseForMonth, getNext12Months, formatMonth } from "../utils/BudgetCalculation"
import Input from "../../../components/ui/Input"
import Button from "../../../components/ui/Button"

export default function BudgetMonthlyView() {
    const { budget, setMonthlyIncome } = useBudget()
    const months = getNext12Months()
    const [editingMonth, setEditingMonth] = useState<string | null>(null)
    const [editValue, setEditValue] = useState("")

    const getIncome = (month: string) =>
        budget.monthlyIncomes.find(m => m.month === month)?.income ?? 0

    const getExpenses = (month: string) =>
        budget.spendingList.reduce((sum, e) => sum + expenseForMonth(e, month), 0)

    const confirmEdit = (month: string) => {
        setMonthlyIncome(month, parseFloat(editValue.replace(",", ".")) || 0)
        setEditingMonth(null)
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="font-semibold text-slate-800 mb-4">Vue mensuelle — 12 mois</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="text-left text-slate-500 font-medium py-2 pr-4">Mois</th>
                            <th className="text-right text-slate-500 font-medium py-2 px-3">Revenu</th>
                            <th className="text-right text-slate-500 font-medium py-2 px-3">Dépenses</th>
                            <th className="text-right text-slate-500 font-medium py-2 pl-3">Disponible</th>
                        </tr>
                    </thead>
                    <tbody>
                        {months.map(month => {
                            const income = getIncome(month)
                            const expenses = getExpenses(month)
                            const available = income - expenses
                            const isEditing = editingMonth === month
                            const isCurrentMonth = month === new Date().toISOString().slice(0, 7)

                            return (
                                <tr key={month} className={`border-b border-slate-50 ${isCurrentMonth ? "bg-emerald-50/50" : ""}`}>
                                    <td className="py-2 pr-4">
                                        <span className={`font-medium ${isCurrentMonth ? "text-emerald-700" : "text-slate-700"}`}>
                                            {formatMonth(month)}
                                        </span>
                                        {isCurrentMonth && <span className="ml-2 text-xs text-emerald-500">← ce mois</span>}
                                    </td>
                                    <td className="py-2 px-3 text-right">
                                        {isEditing ? (
                                            <div className="flex items-center justify-end gap-1">
                                                <Input
                                                    type="text"
                                                    inputMode="decimal"
                                                    value={editValue}
                                                    onChange={e => setEditValue(e.target.value)}
                                                    className="w-24 text-right py-1 text-xs"
                                                />
                                                <Button variant="primary" onClick={() => confirmEdit(month)} type="button">✓</Button>
                                                <Button variant="ghost" onClick={() => setEditingMonth(null)} type="button">✕</Button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => { setEditingMonth(month); setEditValue(String(income || "")) }}
                                                className="text-slate-700 hover:text-emerald-600 cursor-pointer"
                                            >
                                                {income > 0 ? `${income}€` : <span className="text-slate-300">— saisir</span>}
                                            </button>
                                        )}
                                    </td>
                                    <td className="py-2 px-3 text-right text-rose-500">
                                        {expenses > 0 ? `-${expenses.toFixed(2)}€` : <span className="text-slate-300">—</span>}
                                    </td>
                                    <td className={`py-2 pl-3 text-right font-medium ${income > 0 ? available >= 0 ? "text-emerald-600" : "text-rose-500" : "text-slate-300"}`}>
                                        {income > 0 ? `${available.toFixed(2)}€` : "—"}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
