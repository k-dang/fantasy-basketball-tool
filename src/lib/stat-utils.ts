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
};
