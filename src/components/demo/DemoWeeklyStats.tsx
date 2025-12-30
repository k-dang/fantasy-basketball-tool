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
import { StatCell } from "@/components/StatCell";
import { mockMatchups } from "@/lib/mock-data";
import type { ParsedMatchup } from "@/types/yahoo";
import { isLowerBetter, shouldSkipHighlight } from "@/lib/stat-utils";

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

type TeamStat = NonNullable<ParsedMatchup["team_stats"]>[number];

export function DemoWeeklyStats() {
  const matchups = mockMatchups.matchups;

  if (!matchups || matchups.length === 0) {
    return null;
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
                {matchups[0]?.team_stats?.map((stat: TeamStat) => (
                  <TableHead key={stat.stat.stat_id}>
                    {stat.stat.display_name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {matchups.map((matchup: ParsedMatchup) => {
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
                    {matchup.team_stats?.map((stat: TeamStat) => (
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

