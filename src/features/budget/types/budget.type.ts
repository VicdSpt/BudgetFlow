export interface FixedExpense{
    id: string
    name: string;
    amount: number;
    paymentDay?: number
    frequency: ExpenseFrequency;
}

export type ExpenseFrequency= "daily" | "weekly" | "monthly" | "quarterly" | "semesterly" | "yearly"


export interface GlobalBudget{
    income: number;
    spendingList: FixedExpense[];
}