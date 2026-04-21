import { useState } from "react"
import { useBudget } from "../hooks/useBudget"
import Button from "../../../components/ui/Button"
import { X, Pencil, Check } from 'lucide-react'
import type { FixedExpense, ExpenseFrequency, ExpenseCategory } from "../types/budget.type"
import { monthlyAmount } from "../utils/BudgetCalculation"

const frequencyConfig: Record<string, { label: string; color: string }> = {
    daily:      { label: "Quotidien",   color: "bg-rose-100 text-rose-600" },
    weekly:     { label: "Hebdo",       color: "bg-orange-100 text-orange-600" },
    monthly:    { label: "Mensuel",     color: "bg-blue-100 text-blue-600" },
    quarterly:  { label: "Trimestriel", color: "bg-violet-100 text-violet-600" },
    semesterly: { label: "Semestriel",  color: "bg-cyan-100 text-cyan-600" },
    yearly:     { label: "Annuel",      color: "bg-emerald-100 text-emerald-600" },
}

const categoryConfig: Record<string, string> = {
    logement:      "🏠",
    transport:     "🚗",
    alimentation:  "🛒",
    abonnements:   "📱",
    sante:         "💊",
    loisirs:       "🎮",
    autre:         "📦",
}

export default function BudgetSummary() {
    const { budget, availableBudget, deleteExpense, updateExpense } = useBudget()
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editForm, setEditForm] = useState<{ name: string; amount: string; frequency: ExpenseFrequency; category: ExpenseCategory } | null>(null)

    const totalExpenses = budget.income - availableBudget
    const spentPercent = budget.income > 0 ? Math.min((totalExpenses / budget.income) * 100, 100) : 0

    const startEdit = (expense: FixedExpense) => {
        setEditingId(expense.id)
        setEditForm({ name: expense.name, amount: String(expense.amount), frequency: expense.frequency, category: expense.category })
    }

    const confirmEdit = (expense: FixedExpense) => {
        if (!editForm) return
        updateExpense({ ...expense, name: editForm.name, amount: parseFloat(editForm.amount.replace(",", ".")) || 0, frequency: editForm.frequency, category: editForm.category })
        setEditingId(null)
        setEditForm(null)
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
            <h2 className="font-semibold text-slate-800">Résumé</h2>

            <div className="flex justify-between items-center py-2 border-b border-slate-50">
                <span className="text-sm text-slate-500">Revenus mensuels</span>
                <span className="font-medium text-slate-800">{budget.income}€</span>
            </div>

            {/* Barre de progression */}
            <div className="flex flex-col gap-1">
                <div className="flex justify-between text-xs text-slate-500">
                    <span>Budget utilisé</span>
                    <span>{spentPercent.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-300 ${spentPercent >= 90 ? "bg-rose-500" : spentPercent >= 70 ? "bg-orange-400" : "bg-emerald-500"}`}
                        style={{ width: `${spentPercent}%` }}
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                {budget.spendingList.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-2">Aucune dépense fixe</p>
                ) : (
                    budget.spendingList.map(expense => {
                        const freqConfig = frequencyConfig[expense.frequency] ?? { label: "Mensuel", color: "bg-blue-100 text-blue-600" }
                        const emoji = categoryConfig[expense.category] ?? "📦"
                        const isEditing = editingId === expense.id

                        if (isEditing && editForm) {
                            return (
                                <div key={expense.id} className="flex flex-col gap-2 p-3 bg-slate-50 rounded-xl">
                                    <div className="grid grid-cols-2 gap-2">
                                        <input className="px-2 py-1 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                        <input className="px-2 py-1 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400" inputMode="decimal" value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <select className="px-2 py-1 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400" value={editForm.frequency} onChange={e => setEditForm({ ...editForm, frequency: e.target.value as ExpenseFrequency })}>
                                            <option value="daily">Journalier</option>
                                            <option value="weekly">Hebdomadaire</option>
                                            <option value="monthly">Mensuel</option>
                                            <option value="quarterly">Trimestriel</option>
                                            <option value="semesterly">Semestriel</option>
                                            <option value="yearly">Annuel</option>
                                        </select>
                                        <select className="px-2 py-1 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-400" value={editForm.category} onChange={e => setEditForm({ ...editForm, category: e.target.value as ExpenseCategory })}>
                                            <option value="logement">🏠 Logement</option>
                                            <option value="transport">🚗 Transport</option>
                                            <option value="alimentation">🛒 Alimentation</option>
                                            <option value="abonnements">📱 Abonnements</option>
                                            <option value="sante">💊 Santé</option>
                                            <option value="loisirs">🎮 Loisirs</option>
                                            <option value="autre">📦 Autre</option>
                                        </select>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" onClick={() => setEditingId(null)}>Annuler</Button>
                                        <Button variant="primary" onClick={() => confirmEdit(expense)}>
                                            <Check size={14} />
                                        </Button>
                                    </div>
                                </div>
                            )
                        }

                        return (
                            <div key={expense.id} className="grid grid-cols-[auto_1fr_100px_80px_64px] items-center gap-2 py-1.5">
                                <span className="text-base">{emoji}</span>
                                <span className="text-sm text-slate-600 truncate">{expense.name}</span>
                                <span className={`text-xs text-center font-medium px-2 py-0.5 rounded-full ${freqConfig.color}`}>
                                    {freqConfig.label}
                                </span>
                                <span className="text-sm font-medium text-rose-500 text-right">-{expense.amount}€</span>
                                <div className="flex justify-end gap-1">
                                    <Button variant="ghost" onClick={() => startEdit(expense)}>
                                        <Pencil size={13} />
                                    </Button>
                                    <Button variant="ghost" onClick={() => deleteExpense(expense.id)}>
                                        <X size={13} />
                                    </Button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Totaux par fréquence */}
            {budget.spendingList.length > 0 && (
                <div className="border-t border-slate-100 pt-3 flex flex-col gap-1">
                    <p className="text-xs font-medium text-slate-500 mb-1">Coût mensuel équivalent</p>
                    {(["monthly", "weekly", "daily", "quarterly", "semesterly", "yearly"] as ExpenseFrequency[])
                        .filter(freq => budget.spendingList.some(e => e.frequency === freq))
                        .map(freq => {
                            const total = budget.spendingList
                                .filter(e => e.frequency === freq)
                                .reduce((sum, e) => sum + monthlyAmount(e), 0)
                            const config = frequencyConfig[freq]
                            return (
                                <div key={freq} className="flex justify-between text-xs text-slate-500">
                                    <span className={`font-medium px-1.5 py-0.5 rounded ${config.color}`}>{config.label}</span>
                                    <span>-{total.toFixed(2)}€/mois</span>
                                </div>
                            )
                        })
                    }
                </div>
            )}

            <div className="flex justify-between items-center py-2 border-t border-slate-100">
                <span className="text-sm font-medium text-slate-700">Disponible</span>
                <span className={`font-semibold text-lg ${availableBudget >= 0 ? "text-emerald-600" : "text-rose-500"}`}>
                    {availableBudget.toFixed(2)}€
                </span>
            </div>
        </div>
    )
}
