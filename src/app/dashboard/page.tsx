"use client";

import { useState } from "react";
import { AuthButton } from "@/components/AuthButton";
import { WeekByWeekStats } from "@/components/WeekByWeekStats";
import { LeagueSelector } from "@/components/LeagueSelector";
import { TeamSelector } from "@/components/TeamSelector";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { useLeagues, useTeams, useTeamMatchups, useAuth } from "@/lib/hooks";
import type { League } from "@/types/yahoo";

export default function DashboardPage() {
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const {
    data: leaguesData,
    isLoading: loadingLeagues,
    error: leaguesError,
    refetch: refetchLeagues,
  } = useLeagues();

  const {
    data: teamsData,
    isLoading: loadingTeams,
    error: teamsError,
  } = useTeams(selectedLeague?.league_key ?? null);

  const {
    data: teamMatchupsData,
    isLoading: loadingMatchups,
    error: matchupsError,
  } = useTeamMatchups(selectedTeam);

  const leagues = leaguesData?.leagues || [];
  const teams = teamsData?.teams || [];
  const matchups = teamMatchupsData?.matchups || [];

  if (authLoading) {
    return (
      <LoadingState
        message="Checking authentication..."
        fullScreen
      />
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Fantasy Basketball Dashboard</h1>
          <AuthButton />
        </div>
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            Please sign in to view your leagues.
          </p>
        </div>
      </div>
    );
  }

  if (loadingLeagues) {
    return (
      <LoadingState
        message="Loading leagues..."
        fullScreen
      />
    );
  }

  if (leaguesError && !leagues.length) {
    return (
      <ErrorState
        error={leaguesError}
        onRetry={() => refetchLeagues()}
        fullScreen
      />
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Fantasy Basketball Dashboard</h1>
        <AuthButton />
      </div>

      <div className="space-y-6">
        <LeagueSelector
          leagues={leagues}
          selectedLeague={selectedLeague}
          onSelect={(league) => {
            setSelectedLeague(league);
            setSelectedTeam(null);
          }}
          isLoading={loadingLeagues}
          error={leaguesError}
          onRetry={() => refetchLeagues()}
        />

        {selectedLeague && (
          <TeamSelector
            teams={teams}
            selectedTeam={selectedTeam}
            onSelect={setSelectedTeam}
            isLoading={loadingTeams}
            error={teamsError}
          />
        )}

        {selectedTeam && (
          <WeekByWeekStats
            matchups={matchups}
            isLoading={loadingMatchups}
            error={matchupsError}
          />
        )}
      </div>
    </div>
  );
}
