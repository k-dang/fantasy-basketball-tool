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
import { Badge } from "@/components/ui/badge";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useTeamMatchups } from "@/lib/hooks";
import { isLowerBetter, shouldSkipHighlight } from "@/lib/stat-utils";
import type { ParsedMatchup } from "@/types/yahoo";
import { useMemo } from "react";

interface CategoryReportCardProps {
  leagueKey: string | null;
  teamKey: string | null;
}

interface CategorySummary {
  statId: string;
  displayName: string;
  wins: number;
  losses: number;
  ties: number;
  games: number;
  winPoints: number;
  averageMargin: number | null;
}

interface GradeResult {
  grade: string;
  variant: "default" | "secondary" | "outline" | "destructive";
}

export const gradeThresholds: Array<{
  min: number;
  grade: string;
  variant: GradeResult["variant"];
}> = [
  { min: 0.75, grade: "A", variant: "default" },
  { min: 0.6, grade: "B", variant: "secondary" },
  { min: 0.5, grade: "C", variant: "outline" },
  { min: 0.4, grade: "D", variant: "destructive" },
];

export function determineOutcome(
  matchup: ParsedMatchup,
  statId: string,
  displayName: string
): { outcome: "win" | "loss" | "tie" | "skip"; margin: number | null } {
  const teamStat = matchup.team_stats?.find(
    (stat) => stat.stat.stat_id === statId
  );
  const opponentStat = matchup.opponent_stats?.find(
    (stat) => stat.stat.stat_id === statId
  );

  if (!teamStat || !opponentStat) {
    return { outcome: "skip", margin: null };
  }

  const teamValue = parseFloat(teamStat.stat.value);
  const opponentValue = parseFloat(opponentStat.stat.value);

  if (Number.isNaN(teamValue) || Number.isNaN(opponentValue)) {
    return { outcome: "skip", margin: null };
  }

  if (teamValue === opponentValue) {
    return { outcome: "tie", margin: 0 };
  }

  const lowerIsBetter = isLowerBetter(statId, displayName);
  const teamWon = lowerIsBetter
    ? teamValue < opponentValue
    : teamValue > opponentValue;

  const normalizedMargin = lowerIsBetter
    ? opponentValue - teamValue
    : teamValue - opponentValue;

  return {
    outcome: teamWon ? "win" : "loss",
    margin: normalizedMargin,
  };
}

export function getGrade(winPoints: number): GradeResult {
  for (const threshold of gradeThresholds) {
    if (winPoints >= threshold.min) {
      return { grade: threshold.grade, variant: threshold.variant };
    }
  }
  return { grade: "F", variant: "destructive" };
}

export function buildCategorySummaries(matchups: ParsedMatchup[]): CategorySummary[] {
  const completedMatchups = matchups.filter(
    (matchup) => matchup.status === "postevent"
  );

  const summaryMap = new Map<string, CategorySummary>();

  for (const matchup of completedMatchups) {
    for (const teamStat of matchup.team_stats ?? []) {
      const { stat } = teamStat;
      if (shouldSkipHighlight(stat.display_name)) {
        continue;
      }

      const existingSummary = summaryMap.get(stat.stat_id) ?? {
        statId: stat.stat_id,
        displayName: stat.display_name,
        wins: 0,
        losses: 0,
        ties: 0,
        games: 0,
        winPoints: 0,
        averageMargin: null,
      };

      const { outcome, margin } = determineOutcome(
        matchup,
        stat.stat_id,
        stat.display_name
      );

      if (outcome === "skip") {
        summaryMap.set(stat.stat_id, existingSummary);
        continue;
      }

      if (outcome === "win") {
        existingSummary.wins += 1;
        existingSummary.winPoints += 1;
      } else if (outcome === "loss") {
        existingSummary.losses += 1;
      } else {
        existingSummary.ties += 1;
        existingSummary.winPoints += 0.5;
      }

      existingSummary.games += 1;

      if (margin !== null) {
        const currentMarginTotal =
          (existingSummary.averageMargin ?? 0) * (existingSummary.games - 1);
        const newAverageMargin =
          (currentMarginTotal + margin) / existingSummary.games;
        existingSummary.averageMargin = newAverageMargin;
      }

      summaryMap.set(stat.stat_id, existingSummary);
    }
  }

  return Array.from(summaryMap.values())
    .filter((summary) => summary.games > 0)
    .sort((a, b) => b.winPoints / b.games - a.winPoints / a.games);
}

export function formatMargin(displayName: string, margin: number | null): string {
  if (margin === null) {
    return "-";
  }

  if (displayName.includes("%")) {
    return `${(margin * 100).toFixed(1)}%`;
  }

  return margin >= 0 ? `+${margin.toFixed(2)}` : margin.toFixed(2);
}

export function CategoryReportCard({
  leagueKey,
  teamKey,
}: CategoryReportCardProps) {
  const {
    data: matchupsData,
    isLoading,
    error,
  } = useTeamMatchups(leagueKey, teamKey);

  const summaries = useMemo(() => {
    return buildCategorySummaries(matchupsData?.matchups ?? []);
  }, [matchupsData]);

  if (isLoading) {
    return (
      <LoadingState
        title="Season Report Card"
        message="Calculating category results..."
      />
    );
  }

  if (error) {
    return <ErrorState title="Season Report Card" error={error} />;
  }

  if (summaries.length === 0) {
    return (
      <EmptyState
        title="Season Report Card"
        description="No completed matchups yet"
        message="Category results will appear once matchups are finalized."
      />
    );
  }

  const strongestCategory = summaries[0];
  const weakestCategory = summaries[summaries.length - 1];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Season Report Card</CardTitle>
        <CardDescription>
          Wins, losses, and average margins for each scoring category across
          completed matchups.
        </CardDescription>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <p className="font-medium text-foreground">Biggest Strength</p>
            <p className="text-muted-foreground">
              {strongestCategory.displayName} ({strongestCategory.wins}-
              {strongestCategory.losses}-{strongestCategory.ties})
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">Biggest Opportunity</p>
            <p className="text-muted-foreground">
              {weakestCategory.displayName} ({weakestCategory.wins}-
              {weakestCategory.losses}-{weakestCategory.ties})
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Grade</TableHead>
                <TableHead>Record</TableHead>
                <TableHead>Win Rate</TableHead>
                <TableHead>Avg Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaries.map((summary) => {
                const winRate = summary.winPoints / summary.games;
                const { grade, variant } = getGrade(winRate);
                return (
                  <TableRow key={summary.statId}>
                    <TableCell className="font-medium">
                      {summary.displayName}
                    </TableCell>
                    <TableCell>
                      <Badge variant={variant}>{grade}</Badge>
                    </TableCell>
                    <TableCell>
                      {summary.wins}-{summary.losses}-{summary.ties}
                    </TableCell>
                    <TableCell>{(winRate * 100).toFixed(1)}%</TableCell>
                    <TableCell>
                      {formatMargin(summary.displayName, summary.averageMargin)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
