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
import { useTeamRosterAverages } from "@/lib/hooks";
import Image from "next/image";

interface RosterAveragesProps {
  leagueKey: string | null;
  teamKey: string | null;
}

export function RosterAverages({
  leagueKey,
  teamKey,
}: RosterAveragesProps) {
  const {
    data: rosterAveragesData,
    isLoading,
    error,
  } = useTeamRosterAverages(leagueKey, teamKey);

  const roster = rosterAveragesData?.roster || [];

  if (isLoading) {
    return (
      <LoadingState title="Roster Averages" message="Loading roster averages..." />
    );
  }

  if (error) {
    return <ErrorState title="Roster Averages" error={error} />;
  }

  if (!roster || roster.length === 0) {
    return (
      <EmptyState
        title="Roster Averages"
        description="No roster averages data available"
        message="No players found for this team."
      />
    );
  }

  // Use the order from the first player's aggregated stats
  const stats =
    roster[0]?.aggregated_stats?.map((stat) => ({
      stat_id: stat.stat_id,
      display_name: stat.display_name,
    })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roster Averages</CardTitle>
        <CardDescription>
          Average weekly statistics for each player on the roster
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
                    </div>
                  </TableCell>
                  {stats.map((stat) => {
                    const playerStat = player.aggregated_stats?.find(
                      (s) => s.stat_id === stat.stat_id
                    );
                    const average = playerStat?.average;
                    const formattedValue =
                      average === null || average === undefined
                        ? "-"
                        : average.toFixed(1);

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

