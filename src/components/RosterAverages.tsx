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
import { ArrowUp, ArrowDown } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

interface RosterAveragesProps {
  leagueKey: string | null;
  teamKey: string | null;
}

export function RosterAverages({ leagueKey, teamKey }: RosterAveragesProps) {
  const {
    data: rosterAveragesData,
    isLoading,
    error,
  } = useTeamRosterAverages(leagueKey, teamKey);

  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: "asc" | "desc" | null;
  }>({ column: null, direction: null });

  const originalRoster = useMemo(
    () => rosterAveragesData?.roster || [],
    [rosterAveragesData?.roster]
  );

  // Calculate min/max ranges for each stat (excluding null values)
  const statRanges = useMemo(() => {
    const ranges: Record<string, { min: number; max: number }> = {};

    originalRoster.forEach((player) => {
      player.aggregated_stats?.forEach((stat) => {
        if (stat.average === null || stat.average === undefined) {
          return;
        }

        if (!ranges[stat.stat_id]) {
          ranges[stat.stat_id] = { min: stat.average, max: stat.average };
        } else {
          ranges[stat.stat_id].min = Math.min(
            ranges[stat.stat_id].min,
            stat.average
          );
          ranges[stat.stat_id].max = Math.max(
            ranges[stat.stat_id].max,
            stat.average
          );
        }
      });
    });

    return ranges;
  }, [originalRoster]);

  // Sort roster based on sort state
  const roster = useMemo(() => {
    if (!sortState.column || !sortState.direction) {
      return originalRoster;
    }

    const sorted = [...originalRoster].sort((a, b) => {
      const aStat = a.aggregated_stats?.find(
        (s) => s.stat_id === sortState.column
      );
      const bStat = b.aggregated_stats?.find(
        (s) => s.stat_id === sortState.column
      );

      const aValue = aStat?.average ?? null;
      const bValue = bStat?.average ?? null;

      // Handle null values - place them at the end
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;

      // Sort numerically
      const diff = aValue - bValue;
      return sortState.direction === "asc" ? diff : -diff;
    });

    return sorted;
  }, [originalRoster, sortState]);

  if (isLoading) {
    return (
      <LoadingState
        title="Roster Averages"
        message="Loading roster averages..."
      />
    );
  }

  if (error) {
    return <ErrorState title="Roster Averages" error={error} />;
  }

  if (!originalRoster || originalRoster.length === 0) {
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
    originalRoster[0]?.aggregated_stats?.map((stat) => ({
      stat_id: stat.stat_id,
      display_name: stat.display_name,
    })) || [];

  const handleSortClick = (statId: string) => {
    setSortState((prev) => {
      if (prev.column !== statId) {
        // New column - sort ascending
        return { column: statId, direction: "asc" };
      } else if (prev.direction === "asc") {
        // Same column, ascending -> descending
        return { column: statId, direction: "desc" };
      } else if (prev.direction === "desc") {
        // Same column, descending -> unsorted
        return { column: null, direction: null };
      } else {
        // Fallback to ascending
        return { column: statId, direction: "asc" };
      }
    });
  };

  // Get background color for a stat value based on its position in the range
  const getStatBackgroundColor = (
    statId: string,
    value: number | null | undefined
  ): string => {
    if (value === null || value === undefined) {
      return "";
    }

    const range = statRanges[statId];
    if (!range || range.min === range.max) {
      // No range or all values are the same - no color
      return "";
    }

    // Normalize value to 0-1 where 1 is best (max) and 0 is worst (min)
    const normalized = (value - range.min) / (range.max - range.min);

    // Interpolate hue from green (120) to red (0)
    // Best values (normalized = 1) -> green (120)
    // Worst values (normalized = 0) -> red (0)
    const hue = normalized * 120;

    // Use a light background with good saturation for visibility
    return `hsl(${hue}, 70%, 90%)`;
  };

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
                {stats.map((stat) => {
                  const isSorted = sortState.column === stat.stat_id;
                  const isAsc = sortState.direction === "asc";
                  const isDesc = sortState.direction === "desc";

                  return (
                    <TableHead
                      key={stat.stat_id}
                      className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
                      onClick={() => handleSortClick(stat.stat_id)}
                    >
                      <div className="flex items-center gap-1">
                        <span>{stat.display_name}</span>
                        {isSorted && isAsc && (
                          <ArrowUp className="size-4 shrink-0" />
                        )}
                        {isSorted && isDesc && (
                          <ArrowDown className="size-4 shrink-0" />
                        )}
                      </div>
                    </TableHead>
                  );
                })}
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

                    const backgroundColor = getStatBackgroundColor(
                      stat.stat_id,
                      average
                    );

                    return (
                      <TableCell
                        key={stat.stat_id}
                        style={
                          backgroundColor ? { backgroundColor } : undefined
                        }
                      >
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
