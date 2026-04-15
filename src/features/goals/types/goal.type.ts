export type GoalStatus = "active" | "completed" | "paused";

export interface Goal {
  id: string;
  name: string;
  description: string;
  targetSavings: number;
  currentSavings: number;
  deadlineDate?: string;
  status: GoalStatus;
  monthlyContribution?: number
}


