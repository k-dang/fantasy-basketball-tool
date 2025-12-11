"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { mockMatchups, mockRosterAverages } from "@/lib/mock-data";
import {
  calculateCategoryTotals,
  identifyExploitableWeaknesses,
} from "@/lib/stat-utils";
import type { ParsedMatchup } from "@/types/yahoo";

export function DemoOpponentScoutTab() {
  const matchups = mockMatchups.matchups;

  // Filter matchups that have opponent team keys
  const matchupsWithOpponents = useMemo(() => {
    return matchups.filter(
      (matchup) =>
        matchup.opponent_team_key && matchup.opponent_team_key.length > 0
    );
  }, [matchups]);

  const [selectedMatchup, setSelectedMatchup] =
    useState<ParsedMatchup | null>(matchupsWithOpponents[0] || null);

  if (!matchupsWithOpponents || matchupsWithOpponents.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Sticky header with week selector */}
      <div className="sticky top-0 z-20 bg-background border-b pb-4 mb-4">
        <div className="mb-3">
          <h2 className="text-2xl font-semibold">Opponent Scout</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Analyze opponent team strengths and weaknesses by comparing category
            averages.
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
        <DemoOpponentScout
          opponentTeamKey={selectedMatchup.opponent_team_key}
          userTeamKey="423.l.123456.t.1"
          matchupWeek={selectedMatchup.week}
          onClose={() => setSelectedMatchup(null)}
        />
      )}
    </div>
  );
}

// Simplified demo version of OpponentScout that uses mock data
function DemoOpponentScout({
  opponentTeamKey,
  userTeamKey,
  matchupWeek,
  onClose,
}: {
  opponentTeamKey: string;
  userTeamKey: string;
  matchupWeek: number;
  onClose: () => void;
}) {
  // Use the same mock roster averages for both teams (in real app, would fetch opponent's roster)
  const userRoster = mockRosterAverages.roster;
  const opponentRoster = mockRosterAverages.roster; // Simplified: same roster for demo

  const userTotals = useMemo(() => {
    return calculateCategoryTotals(userRoster);
  }, [userRoster]);

  const opponentTotals = useMemo(() => {
    return calculateCategoryTotals(opponentRoster);
  }, [opponentRoster]);

  const weaknesses = useMemo(() => {
    if (
      Object.keys(opponentTotals).length === 0 ||
      Object.keys(userTotals).length === 0
    ) {
      return [];
    }
    return identifyExploitableWeaknesses(opponentTotals, userTotals);
  }, [opponentTotals, userTotals]);

  // For demo purposes, show a simplified version
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Week {matchupWeek} Analysis</h3>
          <p className="text-sm text-muted-foreground">
            Comparing team category averages
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Opponent scout analysis would appear here. In the full version, this
        shows detailed category comparisons and exploitable weaknesses.
      </p>
      {weaknesses.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Top Exploitable Weaknesses:</p>
          <ul className="list-disc list-inside text-sm space-y-1">
            {weaknesses.slice(0, 3).map((weakness) => (
              <li key={weakness.statId}>
                {weakness.displayName}: {weakness.percentageDifference.toFixed(1)}% advantage
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

