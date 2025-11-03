"use client";

import { useState } from "react";
import { WeeklyStats } from "@/components/WeeklyStats";
import { LeagueSelector } from "@/components/LeagueSelector";
import { TeamSelector } from "@/components/TeamSelector";
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";
import { useLeagues, useTeams, useTeamMatchups } from "@/lib/hooks";
import type { League } from "@/types/yahoo";
import { SignoutButton } from "@/components/SignoutButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  loadLeagueSelection,
  loadTeamSelection,
  saveLeagueSelection,
  saveTeamSelection,
} from "@/lib/storage-utils";

export default function DashboardPage() {
  const [selectedLeague, setSelectedLeague] = useState<League | null>(
    loadLeagueSelection()
  );
  const [selectedTeam, setSelectedTeam] = useState<string | null>(
    loadTeamSelection()
  );

  const {
    data: leaguesData,
    isLoading: loadingLeagues,
    error: leaguesError,
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
  } = useTeamMatchups(selectedLeague?.league_key ?? null, selectedTeam);

  const leagues = leaguesData?.leagues || [];
  const teams = teamsData?.teams || [];
  const matchups = teamMatchupsData?.matchups || [];

  const handleLeagueSelect = (league: League) => {
    saveLeagueSelection(league);
    setSelectedLeague(league);
    setSelectedTeam(null);
  };

  const handleTeamSelect = (team: string) => {
    saveTeamSelection(team);
    setSelectedTeam(team);
  };

  if (loadingLeagues) {
    return <LoadingState message="Loading..." fullScreen />;
  }

  if (leaguesError && !leagues.length) {
    return <ErrorState error={leaguesError} fullScreen />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Fantasy Basketball Dashboard</h1>
        <SignoutButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <LeagueSelector
            leagues={leagues}
            selectedLeague={selectedLeague}
            onSelect={handleLeagueSelect}
            isLoading={loadingLeagues}
            error={leaguesError}
          />

          {selectedLeague && (
            <TeamSelector
              teams={teams}
              selectedTeam={selectedTeam}
              onSelect={handleTeamSelect}
              isLoading={loadingTeams}
              error={teamsError}
            />
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedTeam && (
            <Tabs defaultValue="weekly-stats">
              <TabsList>
                <TabsTrigger value="weekly-stats">Weekly Stats</TabsTrigger>
              </TabsList>
              <TabsContent value="weekly-stats">
                <WeeklyStats
                  matchups={matchups}
                  isLoading={loadingMatchups}
                  error={matchupsError}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
