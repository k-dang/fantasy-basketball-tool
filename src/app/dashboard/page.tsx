"use client";

import { useState, useEffect } from "react";
import { WeeklyStats } from "@/components/WeeklyStats";
import { TeamRoster } from "@/components/TeamRoster";
import { LeagueSelector } from "@/components/LeagueSelector";
import { TeamSelector } from "@/components/TeamSelector";
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
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  // Load selections from localStorage after component mounts (client-side only)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedLeague(loadLeagueSelection());
    setSelectedTeam(loadTeamSelection());
  }, []);

  const handleLeagueSelect = (league: League) => {
    saveLeagueSelection(league);
    setSelectedLeague(league);
    setSelectedTeam(null);
  };

  const handleTeamSelect = (team: string) => {
    saveTeamSelection(team);
    setSelectedTeam(team);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Fantasy Basketball Dashboard</h1>
        <SignoutButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <LeagueSelector
            selectedLeague={selectedLeague}
            onSelect={handleLeagueSelect}
          />

          {selectedLeague && (
            <TeamSelector
              leagueKey={selectedLeague?.league_key ?? null}
              selectedTeam={selectedTeam}
              onSelect={handleTeamSelect}
            />
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedTeam && (
            <Tabs defaultValue="weekly-stats">
              <TabsList>
                <TabsTrigger value="weekly-stats">Weekly Stats</TabsTrigger>
                <TabsTrigger value="roster">Roster</TabsTrigger>
              </TabsList>
              <TabsContent value="weekly-stats">
                <WeeklyStats
                  leagueKey={selectedLeague?.league_key ?? null}
                  teamKey={selectedTeam}
                />
              </TabsContent>
              <TabsContent value="roster">
                <TeamRoster
                  leagueKey={selectedLeague?.league_key ?? null}
                  teamKey={selectedTeam}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
