export type ExpenseFrequency = "daily" | "weekly" | "monthly" | "quarterly" | "semesterly" | "yearly"

export type ExpenseCategory = "logement" | "transport" | "alimentation" | "abonnements" | "sante" | "loisirs" | "autre"

export interface FixedExpense {
    id: string
    name: string
    amount: number
    frequency: ExpenseFrequency
    category: ExpenseCategory
    paymentDay?: number
}

export interface GlobalBudget {
    income: number
    spendingList: FixedExpense[]
}
