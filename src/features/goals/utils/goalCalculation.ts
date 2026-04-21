export function percentageComplete(
  currentSavings: number,
  targetSavings: number,
): number {
  if (targetSavings === 0) return 0; // Avoid division by zero
  return Math.min(Math.round((currentSavings / targetSavings) * 100), 100);
}

export function monthsUntilDeadline(deadlineDate: string): number {
  const now = new Date()
  const deadline = new Date(deadlineDate)
  const months = (deadline.getFullYear() - now.getFullYear()) * 12 + (deadline.getMonth() - now.getMonth())
  return Math.max(months, 0)
}

export function suggestedMonthlyContribution(
  currentSavings: number,
  targetSavings: number,
  deadlineDate: string
): number {
  const months = monthsUntilDeadline(deadlineDate)
  if (months === 0) return 0
  const remaining = targetSavings - currentSavings
  if (remaining <= 0) return 0
  return Math.ceil(remaining / months)
}

export function monthsToGoal(
  currentSavings: number,
  targetSavings: number,
  monthlySavings: number,
): number {
  if (monthlySavings <= 0) return Infinity; // Avoid infinite loop
  const remainingAmount = targetSavings - currentSavings;
  if (remainingAmount <= 0) return 0; // Goal already achieved
  return Math.ceil(remainingAmount / monthlySavings);
}
