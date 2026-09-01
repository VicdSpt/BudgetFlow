import type { AppState } from "../types/common.type"
import type { Goal, GoalStatus } from "../features/goals/types/goal.type"
import type {
  ExpenseCategory,
  ExpenseFrequency,
  FixedExpense,
  GlobalBudget,
  MonthlyIncome,
} from "../features/budget/types/budget.type"
import type {
  Transaction,
  TransactionCategory,
  TransactionTag,
} from "../features/transactions/types/transaction.type"

/**
 * Validation runtime des données qui franchissent une frontière de confiance.
 * Utilisé aujourd'hui par l'import de sauvegarde JSON (SettingsPage).
 * À brancher ensuite sur localStorage (AppProvider) et les lignes Supabase (mappers).
 *
 * TypeScript n'existe pas à l'exécution : une annotation de type est une
 * promesse faite au compilateur, pas une vérification. Ici on produit la preuve.
 */

// ---------------------------------------------------------------------------
// Primitives
// ---------------------------------------------------------------------------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown): value is number {
  // Number.isFinite rejette NaN et Infinity, contrairement à typeof === "number"
  return typeof value === "number" && Number.isFinite(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

function isOptional<T>(
  value: unknown,
  guard: (candidate: unknown) => candidate is T,
): value is T | undefined {
  return value === undefined || guard(value)
}

const ISO_DAY = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/
const ISO_MONTH = /^\d{4}-(0[1-9]|1[0-2])$/
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/

/**
 * Valide une date calendaire réelle au format YYYY-MM-DD.
 *
 * Attention : `Date.parse` ne rejette PAS les dates impossibles, il les fait
 * déborder ("2026-02-31" devient le 3 mars). Le seul contrôle fiable est
 * l'aller-retour : reformater le timestamp et comparer à la chaîne d'origine.
 */
function isIsoDay(value: unknown): value is string {
  if (typeof value !== "string" || !ISO_DAY.test(value)) return false
  const timestamp = Date.parse(value)
  if (Number.isNaN(timestamp)) return false
  return new Date(timestamp).toISOString().startsWith(value)
}

function isIsoMonth(value: unknown): value is string {
  return typeof value === "string" && ISO_MONTH.test(value)
}

function isTimestamp(value: unknown): value is string {
  if (typeof value !== "string") return false
  // On accepte un jour seul (données saisies à la main) ou un ISO 8601 complet.
  if (isIsoDay(value)) return true
  return ISO_TIMESTAMP.test(value) && !Number.isNaN(Date.parse(value))
}

/**
 * Construit un type guard pour une union de littéraux.
 *
 * `Record<T, true>` force l'exhaustivité à la compilation : ajouter un membre
 * à l'union sans l'ajouter ici casse le build. Oublier un membre ferait
 * silencieusement rejeter des données valides — c'est le bug qu'on évite.
 */
function unionGuard<T extends string>(members: Record<T, true>) {
  return (value: unknown): value is T =>
    // hasOwnProperty et non `value in members` : sinon "toString" passerait
    typeof value === "string" && Object.prototype.hasOwnProperty.call(members, value)
}

// ---------------------------------------------------------------------------
// Unions du domaine
// ---------------------------------------------------------------------------

const isGoalStatus = unionGuard<GoalStatus>({
  active: true,
  completed: true,
  paused: true,
})

const isExpenseFrequency = unionGuard<ExpenseFrequency>({
  daily: true,
  weekly: true,
  monthly: true,
  quarterly: true,
  semesterly: true,
  yearly: true,
})

const isExpenseCategory = unionGuard<ExpenseCategory>({
  logement: true,
  transport: true,
  alimentation: true,
  abonnements: true,
  sante: true,
  loisirs: true,
  investissement: true,
  autre: true,
})

const isTransactionCategory = unionGuard<TransactionCategory>({
  food: true,
  transport: true,
  housing: true,
  health: true,
  leisure: true,
  tech: true,
  other: true,
})

const isTransactionTag = unionGuard<TransactionTag>({
  fixed: true,
  variable: true,
  "one-time": true,
})

// ---------------------------------------------------------------------------
// Entités — guards
// ---------------------------------------------------------------------------

export function isGoal(value: unknown): value is Goal {
  if (!isRecord(value)) return false
  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    typeof value.description === "string" &&
    isFiniteNumber(value.targetSavings) &&
    isFiniteNumber(value.currentSavings) &&
    isGoalStatus(value.status) &&
    isOptional(value.deadlineDate, isIsoDay)
  )
}

function isPaymentDay(value: unknown): value is number {
  return isFiniteNumber(value) && Number.isInteger(value) && value >= 1 && value <= 31
}

export function isFixedExpense(value: unknown): value is FixedExpense {
  if (!isRecord(value)) return false
  return (
    isNonEmptyString(value.id) &&
    isNonEmptyString(value.name) &&
    isFiniteNumber(value.amount) &&
    isExpenseFrequency(value.frequency) &&
    isExpenseCategory(value.category) &&
    isOptional(value.paymentDay, isPaymentDay)
  )
}

export function isMonthlyIncome(value: unknown): value is MonthlyIncome {
  if (!isRecord(value)) return false
  return isIsoMonth(value.month) && isFiniteNumber(value.income)
}

export function isTransaction(value: unknown): value is Transaction {
  if (!isRecord(value)) return false
  return (
    isNonEmptyString(value.id) &&
    isFiniteNumber(value.amount) &&
    isTransactionCategory(value.category) &&
    typeof value.description === "string" &&
    isIsoDay(value.date) &&
    isTransactionTag(value.tag) &&
    isTimestamp(value.createdAt)
  )
}

// ---------------------------------------------------------------------------
// Entités — parsers ("parse, don't validate")
// ---------------------------------------------------------------------------

/**
 * Un parser normalise AVANT de valider, puis renvoie l'entité ou null.
 *
 * Pourquoi pas juste un guard : `mappers.ts` sérialise les optionnels absents
 * en `null` (et non `undefined`). Un guard seul rejetterait l'objectif entier
 * pour un champ facultatif — on perdrait une donnée valide. On normalise donc
 * `null` en `undefined` d'abord, ce qui reste honnête vis-à-vis du type.
 */
export function parseGoal(value: unknown): Goal | null {
  if (!isRecord(value)) return null
  const candidate = { ...value, deadlineDate: value.deadlineDate ?? undefined }
  return isGoal(candidate) ? candidate : null
}

export function parseFixedExpense(value: unknown): FixedExpense | null {
  if (!isRecord(value)) return null
  const candidate = { ...value, paymentDay: value.paymentDay ?? undefined }
  return isFixedExpense(candidate) ? candidate : null
}

export function parseMonthlyIncome(value: unknown): MonthlyIncome | null {
  return isMonthlyIncome(value) ? value : null
}

export function parseTransaction(value: unknown): Transaction | null {
  return isTransaction(value) ? value : null
}

// ---------------------------------------------------------------------------
// Parsing tolérant
// ---------------------------------------------------------------------------

interface Collected<T> {
  items: T[]
  /** Éléments individuellement invalides, écartés. */
  rejected: number
  /** La section existait mais n'était pas un tableau : perte totale. */
  malformed: boolean
}

/**
 * Garde les éléments valides, compte les autres.
 *
 * Choix de design : une sauvegarde partiellement corrompue restaure ce qui est
 * lisible plutôt que de tout rejeter — mais on ne jette jamais en silence.
 *
 * `malformed` distingue « section absente » (normal, ex. vieux fichier exporté
 * avant la feature transactions) de « section présente mais illisible » (perte
 * de données réelle). Confondre les deux masquerait la perte à l'utilisateur.
 */
function collect<T>(value: unknown, parse: (candidate: unknown) => T | null): Collected<T> {
  if (value === undefined || value === null) {
    return { items: [], rejected: 0, malformed: false }
  }
  if (!Array.isArray(value)) {
    return { items: [], rejected: 0, malformed: true }
  }

  const items: T[] = []
  for (const entry of value) {
    const parsed = parse(entry)
    if (parsed !== null) items.push(parsed)
  }
  return { items, rejected: value.length - items.length, malformed: false }
}

export interface ParsedBudget {
  budget: GlobalBudget
  rejected: number
  malformedSections: string[]
}

export function parseGlobalBudget(value: unknown): ParsedBudget {
  const empty: GlobalBudget = { monthlyIncomes: [], spendingList: [] }

  if (value === undefined || value === null) {
    return { budget: empty, rejected: 0, malformedSections: [] }
  }
  if (!isRecord(value)) {
    return { budget: empty, rejected: 0, malformedSections: ["budget"] }
  }

  const incomes = collect(value.monthlyIncomes, parseMonthlyIncome)
  const expenses = collect(value.spendingList, parseFixedExpense)

  const malformedSections: string[] = []
  if (incomes.malformed) malformedSections.push("revenus mensuels")
  if (expenses.malformed) malformedSections.push("dépenses fixes")

  return {
    budget: { monthlyIncomes: incomes.items, spendingList: expenses.items },
    rejected: incomes.rejected + expenses.rejected,
    malformedSections,
  }
}

export type BackupParseResult =
  | { ok: true; data: AppState; skipped: string[] }
  | { ok: false; reason: string }

/**
 * Point d'entrée unique pour une sauvegarde JSON déjà parsée.
 * `raw` est `unknown` et non `any` : le compilateur nous oblige à vérifier.
 */
export function parseBackup(raw: unknown): BackupParseResult {
  if (!isRecord(raw)) {
    return { ok: false, reason: "Le fichier ne contient pas une sauvegarde BudgetFlow." }
  }

  const hasKnownSection = "goals" in raw || "budget" in raw || "transactions" in raw
  if (!hasKnownSection) {
    return { ok: false, reason: "Aucune donnée BudgetFlow reconnue dans ce fichier." }
  }

  const goals = collect(raw.goals, parseGoal)
  const transactions = collect(raw.transactions, parseTransaction)
  const budget = parseGlobalBudget(raw.budget)

  const skipped: string[] = []
  if (goals.malformed) skipped.push("section « objectifs » illisible")
  if (transactions.malformed) skipped.push("section « transactions » illisible")
  for (const section of budget.malformedSections) {
    skipped.push(`section « ${section} » illisible`)
  }
  if (goals.rejected > 0) skipped.push(`${goals.rejected} objectif(s) ignoré(s)`)
  if (transactions.rejected > 0) skipped.push(`${transactions.rejected} transaction(s) ignorée(s)`)
  if (budget.rejected > 0) skipped.push(`${budget.rejected} ligne(s) de budget ignorée(s)`)

  return {
    ok: true,
    data: {
      goals: goals.items,
      budget: budget.budget,
      transactions: transactions.items,
    },
    skipped,
  }
}
