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
import { Badge } from "@/components/ui/badge";
import { useLeagues, useTeamRoster } from "@/lib/hooks";
import Image from "next/image";
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

  // Use the order from the first player's stats (same as WeeklyStats uses first matchup)
  const stats =
    roster[0]?.stats?.map((stat) => ({
      stat_id: stat.stat_id,
      display_name: stat.display_name,
    })) || [];

  // Get badge variant based on injury status
  const getStatusBadgeVariant = (
    status: string | undefined
  ): "destructive" | "outline" | "default" => {
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
  };

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
                  <TableCell className="sticky left-0 bg-background z-10 font-medium">
                    <div className="flex items-center gap-2">
                      <div className="relative size-10 shrink-0">
                        <Image
                          src={player.image_url || ""}
                          alt={player.name || "Player"}
                          fill
                          sizes="48px"
                          className="rounded-full object-cover object-top"
                          unoptimized
                        />
                      </div>
                      <span>{player.name || "Unknown Player"}</span>
                      {player.status && (
                        <Badge
                          variant={getStatusBadgeVariant(player.status)}
                          title={player.status_full || player.status}
                        >
                          {player.status}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  {stats.map((stat) => {
                    const playerStat = player.stats?.find(
                      (s) => s.stat_id === stat.stat_id
                    );
                    const value = playerStat?.value || "-";
                    const formattedValue =
                      value === "-"
                        ? "-"
                        : !isNaN(parseFloat(value))
                        ? parseFloat(value).toFixed(1)
                        : value;

                    return (
                      <TableCell key={stat.stat_id}>{formattedValue}</TableCell>
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
