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
import { useTeamRosterAverages } from "@/lib/hooks";
import {
  calculateCategoryTotals,
  identifyExploitableWeaknesses,
  isLowerBetter,
  shouldSkipHighlight,
} from "@/lib/stat-utils";
import { useMemo } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OpponentScoutProps {
  leagueKey: string | null;
  opponentTeamKey: string | null;
  userTeamKey: string | null;
  matchupWeek: number;
  onClose: () => void;
}

export function OpponentScout({
  leagueKey,
  opponentTeamKey,
  userTeamKey,
  matchupWeek,
  onClose,
}: OpponentScoutProps) {
  const {
    data: opponentRosterData,
    isLoading: opponentLoading,
    error: opponentError,
  } = useTeamRosterAverages(leagueKey, opponentTeamKey);

  const {
    data: userRosterData,
    isLoading: userLoading,
    error: userError,
  } = useTeamRosterAverages(leagueKey, userTeamKey);

  const isLoading = opponentLoading || userLoading;
  const error = opponentError || userError;

  // Calculate category totals
  const opponentTotals = useMemo(() => {
    if (!opponentRosterData?.roster) return {};
    return calculateCategoryTotals(opponentRosterData.roster);
  }, [opponentRosterData]);

  const userTotals = useMemo(() => {
    if (!userRosterData?.roster) return {};
    return calculateCategoryTotals(userRosterData.roster);
  }, [userRosterData]);

  // Identify exploitable weaknesses
  const weaknesses = useMemo(() => {
    if (
      Object.keys(opponentTotals).length === 0 ||
      Object.keys(userTotals).length === 0
    ) {
      return [];
    }
    return identifyExploitableWeaknesses(opponentTotals, userTotals);
  }, [opponentTotals, userTotals]);

  // Get all categories for display (combine both totals)
  const allCategories = useMemo(() => {
    const allStatIds = new Set([
      ...Object.keys(opponentTotals),
      ...Object.keys(userTotals),
    ]);

    return Array.from(allStatIds)
      .map((statId) => {
        const opponentStat = opponentTotals[statId];
        const userStat = userTotals[statId];
        const displayName =
          opponentStat?.displayName || userStat?.displayName || "";
        const opponentValue = opponentStat?.total ?? 0;
        const userValue = userStat?.total ?? 0;

        // Skip stats that shouldn't be highlighted
        if (shouldSkipHighlight(displayName)) return null;

        const lowerIsBetter = isLowerBetter(statId, displayName);
        const difference = lowerIsBetter
          ? opponentValue - userValue
          : userValue - opponentValue;
        const percentageDifference =
          userValue !== 0 ? (difference / userValue) * 100 : 0;

        const weakness = weaknesses.find((w) => w.statId === statId);

        return {
          statId,
          displayName,
          opponentValue,
          userValue,
          difference,
          percentageDifference,
          isExploitable: weakness?.isExploitable ?? false,
          severity: weakness?.severity ?? "low",
        };
      })
      .filter((cat) => cat !== null)
      .sort((a, b) => {
        // Sort exploitable weaknesses first
        if (a!.isExploitable && !b!.isExploitable) return -1;
        if (!a!.isExploitable && b!.isExploitable) return 1;
        // Then by absolute percentage difference
        return Math.abs(b!.percentageDifference) - Math.abs(a!.percentageDifference);
      });
  }, [opponentTotals, userTotals, weaknesses]);

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Opponent Scout</CardTitle>
          <CardDescription>
            Analyzing opponent team for Week {matchupWeek}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingState
            title="Loading Scout Data"
            message="Fetching opponent and team roster averages..."
          />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Opponent Scout</CardTitle>
              <CardDescription>
                Analyzing opponent team for Week {matchupWeek}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ErrorState title="Scout Error" error={error} />
        </CardContent>
      </Card>
    );
  }

  if (allCategories.length === 0) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Opponent Scout</CardTitle>
              <CardDescription>
                Analyzing opponent team for Week {matchupWeek}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <EmptyState
            title="No Data Available"
            description="Unable to load opponent scout data"
            message="Roster averages data is not available for comparison."
          />
        </CardContent>
      </Card>
    );
  }

  const exploitableCount = weaknesses.filter((w) => w.isExploitable).length;

  return (
    <Card className="mt-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Opponent Scout - Week {matchupWeek}</CardTitle>
            <CardDescription>
              Category averages comparison and exploitable weaknesses
              {exploitableCount > 0 && (
                <span className="ml-2 text-green-600 font-medium">
                  ({exploitableCount} exploitable weakness
                  {exploitableCount !== 1 ? "es" : ""})
                </span>
              )}
            </CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-background z-10">
                  Category
                </TableHead>
                <TableHead className="text-right">Opponent Avg</TableHead>
                <TableHead className="text-right">Your Avg</TableHead>
                <TableHead className="text-right">Difference</TableHead>
                <TableHead className="text-right">% Diff</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allCategories.map((category) => {
                if (!category) return null;

                const {
                  statId,
                  displayName,
                  opponentValue,
                  userValue,
                  difference,
                  percentageDifference,
                  isExploitable,
                  severity,
                } = category;

                const lowerIsBetter = isLowerBetter(statId, displayName);
                const isAdvantage = lowerIsBetter
                  ? difference > 0
                  : difference > 0;

                // Format values
                const formatValue = (val: number) => {
                  if (displayName.includes("%")) {
                    return `${(val * 100).toFixed(1)}%`;
                  }
                  return val.toFixed(1);
                };

                // Get badge variant based on exploitability
                const getBadgeVariant = (): "default" | "secondary" | "destructive" => {
                  if (!isExploitable) return "secondary";
                  if (severity === "high") return "destructive";
                  if (severity === "medium") return "default";
                  return "secondary";
                };

                // Get row background color for exploitable weaknesses
                const getRowBackground = () => {
                  if (!isExploitable) return "";
                  if (severity === "high") return "bg-green-50 dark:bg-green-950/20";
                  if (severity === "medium") return "bg-green-50/50 dark:bg-green-950/10";
                  return "";
                };

                return (
                  <TableRow
                    key={statId}
                    className={getRowBackground()}
                  >
                    <TableCell className="sticky left-0 bg-background z-10 font-medium">
                      {displayName}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatValue(opponentValue)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatValue(userValue)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        isAdvantage ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isAdvantage ? "+" : ""}
                      {formatValue(Math.abs(difference))}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        isAdvantage ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isAdvantage ? "+" : ""}
                      {Math.abs(percentageDifference).toFixed(1)}%
                    </TableCell>
                    <TableCell>
                      {isExploitable ? (
                        <Badge variant={getBadgeVariant()}>
                          {severity === "high"
                            ? "High Priority"
                            : severity === "medium"
                            ? "Exploitable"
                            : "Weakness"}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
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

