export interface FixedExpense{
    name: string;
    amount: number;
    paymentDay?: number
}

export interface GlobalBudget{
    income: number;
    spendingList: FixedExpense[];
}