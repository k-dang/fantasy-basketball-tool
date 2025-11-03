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
import type { ParsedMatchup, StatContainer } from "@/types/yahoo";

interface WeekByWeekStatsProps {
  matchups: ParsedMatchup[];
  isLoading?: boolean;
  error?: Error | null;
}

// Get stat value by stat_id
function getStatValue(
  stats: StatContainer[] | undefined,
  statId: string
): string {
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
      <LoadingState title="Week-by-Week Stats" message="Loading matchups..." />
    );
  }

  if (error) {
    return <ErrorState title="Week-by-Week Stats" error={error} />;
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
                {matchups[0]?.team_stats?.map((stat) => (
                  <TableHead key={stat.stat.stat_id}>
                    {stat.stat.display_name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {matchups.map((matchup) => (
                <TableRow key={`week-${matchup.week}-${matchup.week_start}`}>
                  <TableCell className="sticky left-0 bg-background z-10 font-medium">
                    {matchup.week}
                  </TableCell>
                  {matchup.team_stats?.map((stat) => {
                    const value = getStatValue(
                      matchup.team_stats,
                      stat.stat.stat_id
                    );
                    const formattedValue = stat.stat.display_name.includes("%")
                      ? formatPercentage(value)
                      : formatNumber(value);
                    return (
                      <TableCell key={stat.stat.stat_id}>
                        {formattedValue}
                      </TableCell>
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
