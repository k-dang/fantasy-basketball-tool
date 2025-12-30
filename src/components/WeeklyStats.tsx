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
import { useTeamMatchups } from "@/lib/hooks";
import { StatCell } from "@/components/StatCell";
import { isLowerBetter, shouldSkipHighlight } from "@/lib/stat-utils";
import type { ParsedMatchup } from "@/types/yahoo";

const getCategoryResult = (matchup: ParsedMatchup): { wins: number; losses: number; ties: number } | null => {
  if (matchup.status !== "postevent") {
    return null;
  }

  let wins = 0;
  let losses = 0;
  let ties = 0;

  for (const teamStat of matchup.team_stats ?? []) {
    const { stat } = teamStat;
    
    if (shouldSkipHighlight(stat.display_name)) {
      continue;
    }

    const opponentStat = matchup.opponent_stats?.find(
      (s: { stat: { stat_id: string } }) => s.stat.stat_id === stat.stat_id
    );

    if (!opponentStat) continue;

    const teamValue = parseFloat(stat.value);
    const opponentValue = parseFloat(opponentStat.stat.value);

    if (isNaN(teamValue) || isNaN(opponentValue)) continue;

    if (teamValue === opponentValue) {
      ties++;
    } else {
      const lowerIsBetter = isLowerBetter(stat.stat_id, stat.display_name);
      const teamWon = lowerIsBetter 
        ? teamValue < opponentValue 
        : teamValue > opponentValue;
      
      if (teamWon) {
        wins++;
      } else {
        losses++;
      }
    }
  }

  return { wins, losses, ties };
};

interface WeeklyStatsProps {
  leagueKey: string | null;
  teamKey: string | null;
}

export function WeeklyStats({ leagueKey, teamKey }: WeeklyStatsProps) {
  const {
    data: teamMatchupsData,
    isLoading,
    error,
  } = useTeamMatchups(leagueKey, teamKey);

  const matchups = teamMatchupsData?.matchups || [];
  if (isLoading) {
    return <LoadingState title="Weekly Stats" message="Loading matchups..." />;
  }

  if (error) {
    return <ErrorState title="Weekly Stats" error={error} />;
  }

  if (!matchups || matchups.length === 0) {
    return (
      <EmptyState
        title="Weekly Stats"
        description="No matchup data available"
        message="No matchups found for this team."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Stats</CardTitle>
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
                <TableHead>Result</TableHead>
                {matchups[0]?.team_stats?.map((stat) => (
                  <TableHead key={stat.stat.stat_id}>
                    {stat.stat.display_name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {matchups.map((matchup) => {
                const result = getCategoryResult(matchup);
                return (
                  <TableRow key={`week-${matchup.week}-${matchup.week_start}`}>
                    <TableCell className="sticky left-0 bg-background z-10 font-medium">
                      {matchup.week}
                    </TableCell>
                    <TableCell className={
                      result 
                        ? result.wins > result.losses 
                          ? "bg-green-500/10 font-medium"
                          : result.losses > result.wins
                            ? "bg-red-500/10 font-medium"
                            : "font-medium"
                        : "font-medium"
                    }>
                      {result ? `${result.wins}-${result.losses}-${result.ties}` : ""}
                    </TableCell>
                    {matchup.team_stats?.map((stat) => (
                      <StatCell
                        key={stat.stat.stat_id}
                        stat={stat}
                        matchup={matchup}
                      />
                    ))}
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
