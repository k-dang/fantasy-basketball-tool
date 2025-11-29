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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { useLeagues, useTeamRoster } from "@/lib/hooks";
import { calculateStatRanges } from "@/lib/stat-utils";
import { PlayerCell } from "@/components/PlayerCell";
import { ColoredStatCell } from "@/components/ColoredStatCell";
import { useMemo } from "react";
import type { League } from "@/types/yahoo";

interface TeamRosterProps {
  league: League;
  teamKey: string | null;
}

export function Roster({ league, teamKey }: TeamRosterProps) {
  const {
    data: rosterData,
    isLoading,
    error,
  } = useTeamRoster(league.league_key, teamKey, 0);
  const {
    data: leaguesData,
    isLoading: leaguesLoading,
    error: leaguesError,
  } = useLeagues();

  const roster = rosterData?.roster || [];
  // Use the order from the first player's stats (same as WeeklyStats uses first matchup)
  const stats =
    roster[0]?.stats?.map((stat) => ({
      stat_id: stat.stat_id,
      display_name: stat.display_name,
    })) || [];

  // Calculate min/max ranges for each stat (excluding null values)
  const statRanges = useMemo(
    () =>
      calculateStatRanges(rosterData?.roster || [], (player) =>
        player.stats?.map((stat) => ({
          stat_id: stat.stat_id,
          value: stat.value,
        }))
      ),
    [rosterData?.roster]
  );

  if (isLoading || leaguesLoading) {
    return <LoadingState title="Roster" message="Loading roster..." />;
  }

  if (error || leaguesError) {
    return <ErrorState title="Roster" error={error} />;
  }

  if (!roster || roster.length === 0) {
    return (
      <EmptyState
        title="Roster"
        description="No roster data available"
        message="No players found for this team."
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roster</CardTitle>
        <CardDescription>
          Current team roster with player statistics for week{" "}
          {
            leaguesData?.leagues.find((l) => l.league_key === league.league_key)
              ?.current_week
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background z-10">
                  Player
                </TableHead>
                {stats.map((stat) => (
                  <TableHead key={stat.stat_id}>{stat.display_name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {roster.map((player, index) => (
                <TableRow key={`player-${index}-${player.name}`}>
                  <PlayerCell
                    name={player.name}
                    image_url={player.image_url}
                    status={player.status}
                    status_full={player.status_full}
                  />
                  {stats.map((stat) => {
                    const playerStat = player.stats?.find(
                      (s) => s.stat_id === stat.stat_id
                    );
                    const value = playerStat?.value || "-";

                    return (
                      <ColoredStatCell
                        key={stat.stat_id}
                        value={value}
                        statId={stat.stat_id}
                        statRanges={statRanges}
                      />
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
