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
                {matchups[0]?.team_stats?.map((stat: TeamStat) => (
                  <TableHead key={stat.stat.stat_id}>
                    {stat.stat.display_name}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {matchups.map((matchup: ParsedMatchup) => (
                <TableRow key={`week-${matchup.week}-${matchup.week_start}`}>
                  <TableCell className="sticky left-0 bg-background z-10 font-medium">
                    {matchup.week}
                  </TableCell>
                  {matchup.team_stats?.map((stat: TeamStat) => (
                    <StatCell
                      key={stat.stat.stat_id}
                      stat={stat}
                      matchup={matchup}
                    />
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

