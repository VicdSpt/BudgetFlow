export function percentageComplete(
  currentSavings: number,
  targetSavings: number,
): number {
  if (targetSavings === 0) return 0; // Avoid division by zero
  return Math.min((currentSavings / targetSavings) * 100, 100);
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
