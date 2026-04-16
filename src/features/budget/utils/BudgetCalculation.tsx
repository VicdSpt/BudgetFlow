import type { FixedExpense } from "../types/budget.type"

export function monthlyAmount(expense: FixedExpense): number {
    switch(expense.frequency){
        case "daily":
            return expense.amount * 365 / 12;
        case "weekly":
            return expense.amount * 52 / 12;
        case "monthly":
            return expense.amount;
        case "quarterly":
            return expense.amount / 3;
        case "semesterly":
            return expense.amount / 6;
        case "yearly":
            return expense.amount / 12;

        default:
            return expense.amount
    }
}
