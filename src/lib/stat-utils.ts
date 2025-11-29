import type { ParsedMatchup, StatContainer } from "@/types/yahoo";

// Determine if a stat category is one where lower is better (e.g., turnovers)
export function isLowerBetter(statId: string, displayName: string): boolean {
  // Turnovers: stat_id "19" or display_name contains "Turnover"
  if (statId === "19" || displayName.toLowerCase().includes("turnover")) {
    return true;
  }
  // Default: higher is better (most stats)
  return false;
}

// Check if the selected team won a specific stat category in a matchup
export function isStatWonByTeam(
  matchup: ParsedMatchup,
  statId: string,
  displayName: string
): boolean {
  // Find the stat in both team_stats and opponent_stats
  const teamStat = matchup.team_stats?.find((s) => s.stat.stat_id === statId);
  const opponentStat = matchup.opponent_stats?.find(
    (s) => s.stat.stat_id === statId
  );

  // If either stat is missing, cannot determine winner
  if (!teamStat || !opponentStat) {
    return false;
  }

  // Parse numeric values
  const teamValue = parseFloat(teamStat.stat.value);
  const opponentValue = parseFloat(opponentStat.stat.value);

  // If values are not numeric, cannot compare
  if (isNaN(teamValue) || isNaN(opponentValue)) {
    return false;
  }

  // If tied, return false (team didn't win)
  if (teamValue === opponentValue) {
    return false;
  }

  // Determine if lower is better for this stat
  const lowerIsBetter = isLowerBetter(statId, displayName);

  // Compare based on stat direction
  if (lowerIsBetter) {
    return teamValue < opponentValue;
  } else {
    return teamValue > opponentValue;
  }
}

// Get stat value by stat_id
export function getStatValue(
  stats: StatContainer[] | undefined,
  statId: string
): string {
  if (!stats) return "-";
  const stat = stats.find((s) => s.stat.stat_id === statId);
  return stat?.stat.value || "-";
}

// Format percentage values
export function formatPercentage(value: string): string {
  if (value === "-") return "-";
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return `${(num * 100).toFixed(1)}%`;
}

// Format regular number
export function formatNumber(value: string): string {
  if (value === "-") return "-";
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return num.toFixed(1);
}

// Check if a stat should skip highlighting (e.g., FGM/A, FTM/A)
export function shouldSkipHighlight(displayName: string): boolean {
  return displayName.includes("FGM/A") || displayName.includes("FTM/A");
}

// Check if we have valid values for comparison between team and opponent
export function hasValidComparison(
  teamStat: StatContainer | undefined,
  opponentStat: StatContainer | undefined,
  value: string
): boolean {
  if (!teamStat || !opponentStat) return false;
  if (value === "-") return false;
  return (
    !isNaN(parseFloat(teamStat.stat.value)) &&
    !isNaN(parseFloat(opponentStat.stat.value))
  );
}

// Calculate average of numeric values, filtering out invalid values
export function calculateAverage(values: (string | number)[]): number | null {
  const numericValues = values
    .map((v) => (typeof v === "string" ? parseFloat(v) : v))
    .filter((v) => !isNaN(v) && v !== null && v !== undefined);

  if (numericValues.length === 0) return null;

  const sum = numericValues.reduce((acc, val) => acc + val, 0);
  return sum / numericValues.length;
}

// Calculate minimum of numeric values
export function calculateMin(values: (string | number)[]): number | null {
  const numericValues = values
    .map((v) => (typeof v === "string" ? parseFloat(v) : v))
    .filter((v) => !isNaN(v) && v !== null && v !== undefined);

  if (numericValues.length === 0) return null;

  return Math.min(...numericValues);
}

// Calculate maximum of numeric values
export function calculateMax(values: (string | number)[]): number | null {
  const numericValues = values
    .map((v) => (typeof v === "string" ? parseFloat(v) : v))
    .filter((v) => !isNaN(v) && v !== null && v !== undefined);

  if (numericValues.length === 0) return null;

  return Math.max(...numericValues);
}

// Calculate standard deviation of numeric values
export function calculateStandardDeviation(
  values: (string | number)[]
): number | null {
  const numericValues = values
    .map((v) => (typeof v === "string" ? parseFloat(v) : v))
    .filter((v) => !isNaN(v) && v !== null && v !== undefined);

  if (numericValues.length === 0) return null;
  if (numericValues.length === 1) return 0;

  const avg = calculateAverage(values);
  if (avg === null) return null;

  const squareDiffs = numericValues.map((v) => Math.pow(v - avg, 2));
  const avgSquareDiff =
    squareDiffs.reduce((acc, val) => acc + val, 0) / numericValues.length;

  return Math.sqrt(avgSquareDiff);
}

// Get badge variant based on injury status
export function getStatusBadgeVariant(
  status: string | undefined
): "destructive" | "outline" | "default" {
  if (!status) return "default";
  const upperStatus = status.toUpperCase();
  // Serious injuries: INJ, O (Out)
  if (upperStatus === "INJ" || upperStatus === "O") {
    return "destructive";
  }
  // Day-to-day/Questionable: DTD, Q
  if (upperStatus === "DTD" || upperStatus === "Q") {
    return "outline";
  }
  return "default";
}

// Calculate min/max ranges for each stat from roster data
// Works with both player.stats (Roster) and player.aggregated_stats (RosterAverages)
export function calculateStatRanges<T>(
  data: T[],
  getStats: (item: T) => Array<{
    stat_id: string;
    value?: string | number | null;
    average?: number | null;
  }> | undefined
): Record<string, { min: number; max: number }> {
  const ranges: Record<string, { min: number; max: number }> = {};

  data.forEach((item) => {
    const stats = getStats(item);
    if (!stats) return;

    stats.forEach((stat) => {
      // Handle both 'value' (Roster) and 'average' (RosterAverages)
      const numericValue =
        stat.average !== undefined
          ? stat.average
          : stat.value !== undefined && stat.value !== null
          ? typeof stat.value === "string"
            ? parseFloat(stat.value)
            : stat.value
          : null;

      if (numericValue === null || isNaN(numericValue)) {
        return;
      }

      if (!ranges[stat.stat_id]) {
        ranges[stat.stat_id] = { min: numericValue, max: numericValue };
      } else {
        ranges[stat.stat_id].min = Math.min(
          ranges[stat.stat_id].min,
          numericValue
        );
        ranges[stat.stat_id].max = Math.max(
          ranges[stat.stat_id].max,
          numericValue
        );
      }
    });
  });

  return ranges;
}

// Get background color for a stat value based on its position in the range
export function getStatBackgroundColor(
  statId: string,
  value: number | null | undefined,
  statRanges: Record<string, { min: number; max: number }>
): string {
  if (value === null || value === undefined) {
    return "";
  }

  const range = statRanges[statId];
  if (!range || range.min === range.max) {
    // No range or all values are the same - no color
    return "";
  }

  // Normalize value to 0-1 where 1 is best (max) and 0 is worst (min)
  const normalized = (value - range.min) / (range.max - range.min);

  // Interpolate hue from green (120) to red (0)
  // Best values (normalized = 1) -> green (120)
  // Worst values (normalized = 0) -> red (0)
  const hue = normalized * 120;

  // Use a light background with good saturation for visibility
  return `hsl(${hue}, 70%, 90%)`;
}

export interface CategoryWeakness {
  statId: string;
  displayName: string;
  opponentValue: number;
  userValue: number;
  difference: number;
  percentageDifference: number;
  severity: "high" | "medium" | "low";
  isExploitable: boolean;
}

/**
 * Calculate aggregated category totals from roster averages
 * Sums each player's average for each stat category
 * For percentage stats (FG%, FT%), calculates simple average instead of sum
 */
export function calculateCategoryTotals(
  rosterAverages: Array<{
    aggregated_stats?: Array<{
      stat_id: string;
      display_name: string;
      average: number | null;
    }>;
  }>
): Record<string, { displayName: string; total: number; count: number }> {
  const totals: Record<
    string,
    { displayName: string; total: number; count: number }
  > = {};

  // Stat IDs for percentage stats that should be averaged, not summed
  const PERCENTAGE_STAT_IDS = ["5", "8"]; // "5" = FG%, "8" = FT%

  for (const player of rosterAverages) {
    if (!player.aggregated_stats) continue;

    for (const stat of player.aggregated_stats) {
      if (stat.average === null || stat.average === undefined) continue;

      if (!totals[stat.stat_id]) {
        totals[stat.stat_id] = {
          displayName: stat.display_name,
          total: 0,
          count: 0,
        };
      }

      totals[stat.stat_id].total += stat.average;
      totals[stat.stat_id].count += 1;
    }
  }

  // For percentage stats, convert sum to average
  for (const statId of PERCENTAGE_STAT_IDS) {
    if (totals[statId] && totals[statId].count > 0) {
      totals[statId].total = totals[statId].total / totals[statId].count;
    }
  }

  console.log(totals);
  return totals;
}

/**
 * Identify exploitable weaknesses by comparing opponent vs user team category totals
 * Returns categories where the opponent is significantly weaker
 */
export function identifyExploitableWeaknesses(
  opponentTotals: Record<
    string,
    { displayName: string; total: number; count: number }
  >,
  userTotals: Record<
    string,
    { displayName: string; total: number; count: number }
  >,
  thresholdPercentage: number = 0.1 // 10% difference threshold
): CategoryWeakness[] {
  const weaknesses: CategoryWeakness[] = [];

  // Get all unique stat IDs from both totals
  const allStatIds = new Set([
    ...Object.keys(opponentTotals),
    ...Object.keys(userTotals),
  ]);

  for (const statId of allStatIds) {
    const opponentStat = opponentTotals[statId];
    const userStat = userTotals[statId];

    // Skip if either stat is missing or has no data
    if (!opponentStat || !userStat) continue;
    if (opponentStat.total === 0 && userStat.total === 0) continue;

    const opponentValue = opponentStat.total;
    const userValue = userStat.total;
    const displayName = opponentStat.displayName || userStat.displayName;

    // Skip stats that shouldn't be highlighted
    if (shouldSkipHighlight(displayName)) continue;

    const lowerIsBetter = isLowerBetter(statId, displayName);

    let difference: number;
    let percentageDifference: number;
    let isExploitable: boolean;

    if (lowerIsBetter) {
      // For turnovers: exploit if opponent has MORE turnovers
      difference = opponentValue - userValue;
      percentageDifference =
        userValue !== 0 ? (difference / userValue) * 100 : 0;
      // Exploitable if opponent has significantly more turnovers
      isExploitable =
        difference > 0 && percentageDifference >= thresholdPercentage * 100;
    } else {
      // For most stats: exploit if opponent has LESS
      difference = userValue - opponentValue;
      percentageDifference =
        userValue !== 0 ? (difference / userValue) * 100 : 0;
      // Exploitable if opponent is significantly lower
      isExploitable =
        difference > 0 && percentageDifference >= thresholdPercentage * 100;
    }

    // Determine severity based on percentage difference
    let severity: "high" | "medium" | "low" = "low";
    if (Math.abs(percentageDifference) >= 20) {
      severity = "high";
    } else if (Math.abs(percentageDifference) >= 10) {
      severity = "medium";
    }

    weaknesses.push({
      statId,
      displayName,
      opponentValue,
      userValue,
      difference: Math.abs(difference),
      percentageDifference: Math.abs(percentageDifference),
      severity,
      isExploitable,
    });
  }

  // Sort by exploitability and severity
  return weaknesses.sort((a, b) => {
    // Prioritize exploitable weaknesses
    if (a.isExploitable && !b.isExploitable) return -1;
    if (!a.isExploitable && b.isExploitable) return 1;

    // Then sort by severity
    const severityOrder = { high: 0, medium: 1, low: 2 };
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;

    // Finally by percentage difference
    return b.percentageDifference - a.percentageDifference;
  });
}
