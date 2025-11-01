"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import type { ParsedMatchup, Stat } from "@/types/yahoo";

interface WeekByWeekStatsProps {
  matchups: ParsedMatchup[];
  isLoading?: boolean;
  error?: Error | null;
}

// Common stat IDs in Yahoo Fantasy Basketball
const STAT_IDS: Record<string, { label: string; isPercentage: boolean }> = {
  "7": { label: "FG%", isPercentage: true },
  "8": { label: "FT%", isPercentage: true },
  "10": { label: "3PTM", isPercentage: false },
  "12": { label: "PTS", isPercentage: false },
  "15": { label: "REB", isPercentage: false },
  "16": { label: "AST", isPercentage: false },
  "17": { label: "ST", isPercentage: false },
  "18": { label: "BLK", isPercentage: false },
  "19": { label: "TO", isPercentage: false },
};

// Get stat value by stat_id
function getStatValue(stats: Stat[] | undefined, statId: string): string {
  if (!stats) return "-";
  const stat = stats.find((s) => s.stat.stat_id === statId);
  return stat?.stat.value || "-";
}

// Format percentage values
function formatPercentage(value: string): string {
  if (value === "-") return "-";
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return `${(num * 100).toFixed(1)}%`;
}

// Format regular number
function formatNumber(value: string): string {
  if (value === "-") return "-";
  const num = parseFloat(value);
  if (isNaN(num)) return value;
  return num.toFixed(1);
}

export function WeekByWeekStats({
  matchups,
  isLoading,
  error,
}: WeekByWeekStatsProps) {
  if (isLoading) {
    return (
      <LoadingState
        title="Week-by-Week Stats"
        message="Loading matchups..."
      />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Week-by-Week Stats"
        error={error}
      />
    );
  }

  if (!matchups || matchups.length === 0) {
    return (
      <EmptyState
        title="Week-by-Week Stats"
        description="No matchup data available"
        message="No matchups found for this team."
      />
    );
  }

  // Get all unique stat IDs from all matchups
  const allStatIds = new Set<string>();
  matchups.forEach((matchup) => {
    matchup.team_stats?.forEach((stat) => {
      allStatIds.add(stat.stat.stat_id);
    });
  });

  // Order stats by common stat IDs, then others
  const orderedStatIds = Array.from(allStatIds).sort((a, b) => {
    const aOrder = Object.keys(STAT_IDS).indexOf(a);
    const bOrder = Object.keys(STAT_IDS).indexOf(b);
    if (aOrder === -1 && bOrder === -1) return a.localeCompare(b);
    if (aOrder === -1) return 1;
    if (bOrder === -1) return -1;
    return aOrder - bOrder;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Week-by-Week Stats</CardTitle>
        <CardDescription>
          Team statistics for each week of the season
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background z-10">
                  Week
                </TableHead>
                {orderedStatIds.map((statId) => {
                  const statInfo = STAT_IDS[statId];
                  return (
                    <TableHead key={statId}>
                      {statInfo?.label || `Stat ${statId}`}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {matchups.map((matchup, index) => (
                <TableRow key={`week-${matchup.week || index}-${matchup.week_start || index}`}>
                  <TableCell className="sticky left-0 bg-background z-10 font-medium">
                    {matchup.week || `Week ${index + 1}`}
                    {matchup.is_playoffs && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (PO)
                      </span>
                    )}
                    {matchup.is_consolation && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (CO)
                      </span>
                    )}
                  </TableCell>
                  {orderedStatIds.map((statId) => {
                    const statInfo = STAT_IDS[statId];
                    const value = getStatValue(matchup.team_stats, statId);
                    const formattedValue = statInfo?.isPercentage
                      ? formatPercentage(value)
                      : formatNumber(value);
                    return (
                      <TableCell key={statId}>{formattedValue}</TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

