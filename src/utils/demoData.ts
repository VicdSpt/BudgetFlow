import type { Goal } from "../features/goals/types/goal.type"
import type { GlobalBudget } from "../features/budget/types/budget.type"
import type { Transaction } from "../features/transactions/types/transaction.type"
import { getCurrentMonth } from "./dateUtils"

// Mois relatif au mois courant (offset 0 = ce mois, -1 = mois dernier, +6 = dans 6 mois)
function monthWithOffset(offset: number): string {
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth() + offset, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

interface DemoData {
  goals: Goal[]
  budget: GlobalBudget
  transactions: Transaction[]
}

// Jeu de données réaliste, toujours relatif à la date du jour —
// les graphiques et le "mois courant" restent pertinents quel que soit le moment de la visite.
export function buildDemoData(): DemoData {
  const thisMonth = getCurrentMonth()
  const lastMonth = monthWithOffset(-1)
  const createdAt = new Date().toISOString()

  const goals: Goal[] = [
    {
      id: crypto.randomUUID(),
      name: "Nintendo Switch 2",
      description: "Achat prévu en fin d'année",
      targetSavings: 500,
      currentSavings: 300,
      deadlineDate: `${monthWithOffset(5)}-01`,
      status: "active",
    },
    {
      id: crypto.randomUUID(),
      name: "Voyage au Japon",
      description: "2 semaines Tokyo + Kyoto",
      targetSavings: 3000,
      currentSavings: 850,
      deadlineDate: `${monthWithOffset(14)}-01`,
      status: "active",
    },
    {
      id: crypto.randomUUID(),
      name: "Casque audio",
      description: "",
      targetSavings: 250,
      currentSavings: 250,
      deadlineDate: `${monthWithOffset(-2)}-01`,
      status: "completed",
    },
  ]

  const budget: GlobalBudget = {
    monthlyIncomes: [
      { month: lastMonth, income: 1750 },
      { month: thisMonth, income: 1750 },
    ],
    spendingList: [
      { id: crypto.randomUUID(), name: "Loyer", amount: 650, frequency: "monthly", category: "logement" },
      { id: crypto.randomUUID(), name: "Netflix + Spotify", amount: 25, frequency: "monthly", category: "abonnements" },
      { id: crypto.randomUUID(), name: "Forfait mobile", amount: 15, frequency: "monthly", category: "abonnements" },
      { id: crypto.randomUUID(), name: "Assurance habitation", amount: 180, frequency: "yearly", category: "logement" },
      { id: crypto.randomUUID(), name: "Transports en commun", amount: 45, frequency: "monthly", category: "transport" },
    ],
  }

  const transactions: Transaction[] = [
    { id: crypto.randomUUID(), amount: 62.4, category: "food", description: "Courses Carrefour", date: `${thisMonth}-02`, tag: "variable", createdAt },
    { id: crypto.randomUUID(), amount: 28, category: "leisure", description: "Cinéma + popcorn", date: `${thisMonth}-04`, tag: "one-time", createdAt },
    { id: crypto.randomUUID(), amount: 54.9, category: "food", description: "Courses Lidl", date: `${thisMonth}-08`, tag: "variable", createdAt },
    { id: crypto.randomUUID(), amount: 40, category: "transport", description: "Essence", date: `${thisMonth}-09`, tag: "variable", createdAt },
    { id: crypto.randomUUID(), amount: 89.99, category: "tech", description: "Manette sans fil", date: `${thisMonth}-10`, tag: "one-time", createdAt },
    { id: crypto.randomUUID(), amount: 23.5, category: "health", description: "Pharmacie", date: `${thisMonth}-11`, tag: "one-time", createdAt },
    { id: crypto.randomUUID(), amount: 35, category: "leisure", description: "Restaurant entre amis", date: `${thisMonth}-12`, tag: "one-time", createdAt },
    { id: crypto.randomUUID(), amount: 71.2, category: "food", description: "Courses Auchan", date: `${lastMonth}-05`, tag: "variable", createdAt },
    { id: crypto.randomUUID(), amount: 120, category: "housing", description: "Petit électroménager", date: `${lastMonth}-12`, tag: "one-time", createdAt },
    { id: crypto.randomUUID(), amount: 45, category: "transport", description: "Essence", date: `${lastMonth}-18`, tag: "variable", createdAt },
    { id: crypto.randomUUID(), amount: 59.9, category: "food", description: "Courses Carrefour", date: `${lastMonth}-21`, tag: "variable", createdAt },
    { id: crypto.randomUUID(), amount: 15.99, category: "leisure", description: "Jeu Steam en promo", date: `${lastMonth}-26`, tag: "one-time", createdAt },
  ]

  return { goals, budget, transactions }
}
