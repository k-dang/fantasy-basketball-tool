"use client";

import { useState, useMemo } from "react";
import { OpponentScout } from "@/components/OpponentScout";
import { useTeamMatchups } from "@/lib/hooks";
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
      {/* Sticky header with week selector */}
      <div className="sticky top-0 z-20 bg-background border-b pb-4 mb-4">
        <div className="mb-3">
          <h2 className="text-2xl font-semibold">Opponent Scout</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze opponent team strengths and weaknesses by comparing category averages.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 pb-2">
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
                  className="rounded-full whitespace-nowrap"
                  size="sm"
                >
                  Week {matchup.week}
                  {matchup.status === "postevent" && " (Completed)"}
                  {matchup.status === "live" && " (Live)"}
                </Button>
              );
            })}
        </div>
      </div>

      {/* Scout content */}
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

