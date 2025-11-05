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
import { useTeamRoster } from "@/lib/hooks";
import Image from "next/image";

interface TeamRosterProps {
  leagueKey: string | null;
  teamKey: string | null;
}

export function TeamRoster({ leagueKey, teamKey }: TeamRosterProps) {
  const {
    data: rosterData,
    isLoading,
    error,
  } = useTeamRoster(leagueKey, teamKey);

  const roster = rosterData?.roster || [];

  if (isLoading) {
    return <LoadingState title="Roster" message="Loading roster..." />;
  }

  if (error) {
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

  // Get all unique stat IDs from all players
  const allStatIds = new Set<string>();
  roster.forEach((player) => {
    player.stats?.forEach((stat) => {
      allStatIds.add(stat.stat_id);
    });
  });
  const statIds = Array.from(allStatIds).sort();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roster</CardTitle>
        <CardDescription>
          Current team roster with player statistics
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
                {statIds.map((statId) => (
                  <TableHead key={statId}>{statId}</TableHead>
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
                        />
                      </div>
                      <span>{player.name || "Unknown Player"}</span>
                    </div>
                  </TableCell>
                  {statIds.map((statId) => {
                    const playerStat = player.stats?.find(
                      (s) => s.stat_id === statId
                    );
                    const value = playerStat?.value || "-";
                    const formattedValue =
                      value === "-"
                        ? "-"
                        : !isNaN(parseFloat(value))
                        ? parseFloat(value).toFixed(1)
                        : value;

                    return <TableCell key={statId}>{formattedValue}</TableCell>;
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
