import {
  calculateAverage,
  calculateStandardDeviation,
} from "@/lib/stat-utils";
import type { TrendDirection, PlayerWeeklyStats } from "@/types/yahoo";

/**
 * Calculate trend direction based on linear regression slope of last 5 weeks
 * Returns "improving", "stable", or "declining"
 */
export function calculateTrend(
  weeklyValues: number[],
  weeks: number[]
): TrendDirection {
  if (weeklyValues.length < 2) {
    return "stable";
  }

  // Use last 5 weeks for trend calculation (or all available if less than 5)
  const recentCount = Math.min(5, weeklyValues.length);
  const recentValues = weeklyValues.slice(-recentCount);
  const recentWeeks = weeks.slice(-recentCount);

  // Simple linear regression: y = mx + b
  // Calculate slope (m)
  const n = recentValues.length;
  const sumX = recentWeeks.reduce((acc, val) => acc + val, 0);
  const sumY = recentValues.reduce((acc, val) => acc + val, 0);
  const sumXY = recentWeeks.reduce(
    (acc, week, idx) => acc + week * recentValues[idx],
    0
  );
  const sumX2 = recentWeeks.reduce((acc, val) => acc + val * val, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Threshold for determining trend (adjust based on stat scale)
  // For most stats, a slope > 0.1 per week indicates improvement
  // Slope < -0.1 indicates decline
  const threshold = 0.1;

  if (slope > threshold) {
    return "improving";
  } else if (slope < -threshold) {
    return "declining";
  } else {
    return "stable";
  }
}

/**
 * Calculate confidence interval (±1 standard deviation)
 */
export function calculateConfidenceInterval(
  values: (string | number)[]
): number | null {
  const stdDev = calculateStandardDeviation(values);
  return stdDev;
}

/**
 * Predict next week's stat value using weighted moving average
 * Recent weeks (last 3) weighted at 50%, 30%, 20%
 */
export function predictNextWeekStats(
  weeklyStats: PlayerWeeklyStats[],
  statId: string
): {
  predictedValue: number | null;
  confidenceInterval: number | null;
  trend: TrendDirection;
} {
  // Extract values for this stat across all weeks
  const statValues: number[] = [];
  const weeks: number[] = [];

  for (const weeklyStat of weeklyStats) {
    const stat = weeklyStat.stats.find((s) => s.stat_id === statId);
    if (stat) {
      const value = parseFloat(stat.value);
      if (!isNaN(value)) {
        statValues.push(value);
        weeks.push(weeklyStat.week);
      }
    }
  }

  // Need at least 2 weeks of data
  if (statValues.length < 2) {
    return {
      predictedValue: null,
      confidenceInterval: null,
      trend: "stable",
    };
  }

  // Calculate trend
  const trend = calculateTrend(statValues, weeks);

  // Weighted moving average: last 3 weeks get weights 50%, 30%, 20%
  // If fewer than 3 weeks, distribute weights proportionally
  let predictedValue: number;
  const recentCount = Math.min(3, statValues.length);
  const recentValues = statValues.slice(-recentCount);

  if (recentCount === 1) {
    // Only one week: use that value
    predictedValue = recentValues[0];
  } else if (recentCount === 2) {
    // Two weeks: 60% most recent, 40% previous
    predictedValue = recentValues[1] * 0.6 + recentValues[0] * 0.4;
  } else {
    // Three weeks: 50%, 30%, 20%
    predictedValue =
      recentValues[2] * 0.5 + recentValues[1] * 0.3 + recentValues[0] * 0.2;
  }

  // Calculate confidence interval (±1 standard deviation)
  const confidenceInterval = calculateConfidenceInterval(statValues);

  return {
    predictedValue,
    confidenceInterval,
    trend,
  };
}

/**
 * Adjust predicted value based on injury status
 * - DTD/Q: Reduce by 30-50%
 * - INJ/O: Reduce by 100% (set to 0 or null)
 */
export function adjustForInjuryStatus(
  predictedValue: number | null,
  status: string | undefined
): number | null {
  if (predictedValue === null) {
    return null;
  }

  if (!status) {
    return predictedValue;
  }

  const upperStatus = status.toUpperCase();

  // Serious injuries: INJ, O (Out) - set to 0
  if (upperStatus === "INJ" || upperStatus === "O") {
    return 0;
  }

  // Day-to-day/Questionable: DTD, Q - reduce by 40%
  if (upperStatus === "DTD" || upperStatus === "Q") {
    return predictedValue * 0.6;
  }

  // Other statuses: no adjustment
  return predictedValue;
}

