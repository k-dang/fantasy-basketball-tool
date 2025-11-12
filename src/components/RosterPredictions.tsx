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
import { useTeamRosterPredictions } from "@/lib/hooks";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { getStatBackgroundColor } from "@/lib/stat-utils";

interface RosterPredictionsProps {
  leagueKey: string | null;
  teamKey: string | null;
}

export function RosterPredictions({
  leagueKey,
  teamKey,
}: RosterPredictionsProps) {
  const {
    data: predictionsData,
    isLoading,
    error,
  } = useTeamRosterPredictions(leagueKey, teamKey);

  const [sortState, setSortState] = useState<{
    column: string | null;
    direction: "asc" | "desc" | null;
  }>({ column: null, direction: null });

  const originalRoster = useMemo(
    () => predictionsData?.roster || [],
    [predictionsData?.roster]
  );

  // Calculate min/max ranges for each stat (excluding null values)
  const statRanges = useMemo(() => {
    const ranges: Record<string, { min: number; max: number }> = {};

    originalRoster.forEach((player) => {
      player.predicted_stats?.forEach((stat) => {
        if (
          stat.predicted_value === null ||
          stat.predicted_value === undefined
        ) {
          return;
        }

        if (!ranges[stat.stat_id]) {
          ranges[stat.stat_id] = {
            min: stat.predicted_value,
            max: stat.predicted_value,
          };
        } else {
          ranges[stat.stat_id].min = Math.min(
            ranges[stat.stat_id].min,
            stat.predicted_value
          );
          ranges[stat.stat_id].max = Math.max(
            ranges[stat.stat_id].max,
            stat.predicted_value
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
      const aStat = a.predicted_stats?.find(
        (s) => s.stat_id === sortState.column
      );
      const bStat = b.predicted_stats?.find(
        (s) => s.stat_id === sortState.column
      );

      const aValue = aStat?.predicted_value ?? null;
      const bValue = bStat?.predicted_value ?? null;

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
        title="Roster Predictions"
        message="Loading roster predictions..."
      />
    );
  }

  if (error) {
    return <ErrorState title="Roster Predictions" error={error} />;
  }

  if (!originalRoster || originalRoster.length === 0) {
    return (
      <EmptyState
        title="Roster Predictions"
        description="No roster predictions data available"
        message="No players found for this team."
      />
    );
  }

  // Use the order from the first player's predicted stats
  const stats =
    originalRoster[0]?.predicted_stats?.map((stat) => ({
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

  // Get trend icon
  const getTrendIcon = (trend: "improving" | "stable" | "declining") => {
    switch (trend) {
      case "improving":
        return <ArrowUp className="size-3 shrink-0 text-green-600" />;
      case "declining":
        return <ArrowDown className="size-3 shrink-0 text-red-600" />;
      case "stable":
        return <Minus className="size-3 shrink-0 text-gray-500" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roster Predictions</CardTitle>
        <CardDescription>
          Predicted statistics for week {predictionsData?.target_week || "?"}{" "}
          based on historical performance
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
                      {player.status && (
                        <Badge
                          variant={getStatusBadgeVariant(player.status)}
                          title={player.status_full || player.status}
                        >
                          {player.status}
                        </Badge>
                      )}
                      {!player.has_sufficient_data && (
                        <Badge variant="outline" title="Insufficient data">
                          Limited Data
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  {stats.map((stat) => {
                    const playerStat = player.predicted_stats?.find(
                      (s) => s.stat_id === stat.stat_id
                    );
                    const predictedValue = playerStat?.predicted_value;
                    const confidenceInterval = playerStat?.confidence_interval;
                    const trend = playerStat?.trend || "stable";

                    let formattedValue: string;
                    if (
                      predictedValue === null ||
                      predictedValue === undefined
                    ) {
                      formattedValue = "-";
                    } else if (
                      confidenceInterval !== null &&
                      confidenceInterval !== undefined
                    ) {
                      formattedValue = `${predictedValue.toFixed(
                        1
                      )} ± ${confidenceInterval.toFixed(1)}`;
                    } else {
                      formattedValue = predictedValue.toFixed(1);
                    }

                    const backgroundColor = getStatBackgroundColor(
                      stat.stat_id,
                      predictedValue,
                      statRanges
                    );

                    return (
                      <TableCell
                        key={stat.stat_id}
                        style={
                          backgroundColor ? { backgroundColor } : undefined
                        }
                      >
                        <div className="flex items-center gap-1">
                          <span>{formattedValue}</span>
                          {predictedValue !== null &&
                            predictedValue !== undefined &&
                            getTrendIcon(trend)}
                        </div>
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
