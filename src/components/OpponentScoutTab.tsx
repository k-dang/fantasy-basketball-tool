"use client";

import { useState, useMemo } from "react";
import { OpponentScout } from "@/components/OpponentScout";
import { useTeamMatchups } from "@/lib/hooks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import type { ParsedMatchup } from "@/types/yahoo";

interface OpponentScoutTabProps {
  leagueKey: string | null;
  teamKey: string | null;
}

export function OpponentScoutTab({
  leagueKey,
  teamKey,
}: OpponentScoutTabProps) {
  const {
    data: teamMatchupsData,
    isLoading,
    error,
  } = useTeamMatchups(leagueKey, teamKey);

  const matchups = useMemo(() => teamMatchupsData?.matchups || [], [teamMatchupsData]);
  
  // Filter matchups that have opponent team keys
  const matchupsWithOpponents = useMemo(() => {
    return matchups.filter(
      (matchup) => matchup.opponent_team_key && matchup.opponent_team_key.length > 0
    );
  }, [matchups]);

  const [selectedMatchup, setSelectedMatchup] = useState<ParsedMatchup | null>(
    null
  );

  if (isLoading) {
    return <LoadingState title="Opponent Scout" message="Loading matchups..." />;
  }

  if (error) {
    return <ErrorState title="Opponent Scout" error={error} />;
  }

  if (!matchupsWithOpponents || matchupsWithOpponents.length === 0) {
    return (
      <EmptyState
        title="Opponent Scout"
        description="No matchup data available"
        message="No matchups with opponent data found for this team."
      />
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Opponent Scout</CardTitle>
          <CardDescription>
            Analyze opponent team strengths and weaknesses by comparing category
            averages. Select a matchup week to scout the opponent.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2">
            {matchupsWithOpponents.map((matchup) => {
              const isSelected =
                selectedMatchup &&
                selectedMatchup.week === matchup.week &&
                selectedMatchup.week_start === matchup.week_start;

              return (
                <Button
                  key={`week-${matchup.week}-${matchup.week_start}`}
                  variant={isSelected ? "default" : "outline"}
                  onClick={() => {
                    // Toggle selection - if clicking the same matchup, deselect it
                    if (isSelected) {
                      setSelectedMatchup(null);
                    } else {
                      setSelectedMatchup(matchup);
                    }
                  }}
                  className="justify-start"
                >
                  <span className="truncate">
                    Week {matchup.week}
                    {matchup.status === "postevent" && " (Completed)"}
                    {matchup.status === "live" && " (Live)"}
                  </span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {selectedMatchup && selectedMatchup.opponent_team_key && (
        <OpponentScout
          leagueKey={leagueKey}
          opponentTeamKey={selectedMatchup.opponent_team_key}
          userTeamKey={teamKey}
          matchupWeek={selectedMatchup.week}
          onClose={() => setSelectedMatchup(null)}
        />
      )}
    </div>
  );
}

