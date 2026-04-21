export type ExpenseFrequency = "daily" | "weekly" | "monthly" | "quarterly" | "semesterly" | "yearly"

export type ExpenseCategory = "logement" | "transport" | "alimentation" | "abonnements" | "sante" | "loisirs" | "investissement" | "autre"

export interface FixedExpense {
    id: string
    name: string
    amount: number
    frequency: ExpenseFrequency
    category: ExpenseCategory
    paymentDay?: number
}

export interface MonthlyIncome {
    month: string  // format "YYYY-MM"
    income: number
}

export interface GlobalBudget {
    monthlyIncomes: MonthlyIncome[]
    spendingList: FixedExpense[]
}
