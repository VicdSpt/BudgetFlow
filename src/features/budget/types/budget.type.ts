export interface FixedExpense{
    id: string
    name: string;
    amount: number;
    paymentDay?: number
}

export interface GlobalBudget{
    income: number;
    spendingList: FixedExpense[];
}