import type { FixedExpense } from "../types/budget.type"

export function monthlyAmount(expense: FixedExpense): number {
    switch (expense.frequency) {
        case "daily":      return expense.amount * 365 / 12
        case "weekly":     return expense.amount * 52 / 12
        case "monthly":    return expense.amount
        case "quarterly":  return expense.amount / 3
        case "semesterly": return expense.amount / 6
        case "yearly":     return expense.amount / 12
        default:           return expense.amount
    }
}

// Retourne le coût réel d'une dépense pour un mois donné (YYYY-MM)
export function expenseForMonth(expense: FixedExpense, month: string): number {
    const date = new Date(month + "-01")
    const monthIndex = date.getMonth() // 0-11

    switch (expense.frequency) {
        case "daily":
        case "weekly":
        case "monthly":
            return expense.amount
        case "quarterly":
            // tombe en janvier(0), avril(3), juillet(6), octobre(9)
            return monthIndex % 3 === 0 ? expense.amount : 0
        case "semesterly":
            // tombe en janvier(0) et juillet(6)
            return monthIndex % 6 === 0 ? expense.amount : 0
        case "yearly":
            // tombe en janvier(0)
            return monthIndex === 0 ? expense.amount : 0
        default:
            return expense.amount
    }
}

// Génère les 12 prochains mois au format YYYY-MM
export function getNext12Months(): string[] {
    const months: string[] = []
    const now = new Date()
    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
        const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
        months.push(month)
    }
    return months
}

// Formate YYYY-MM en "Avr 2026"
export function formatMonth(month: string): string {
    const date = new Date(month + "-01")
    return date.toLocaleDateString("fr-FR", { month: "short", year: "numeric" })
}
