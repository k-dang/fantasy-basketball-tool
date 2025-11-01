"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AuthButton } from "@/components/AuthButton";
import { useLeagues, useTeams, useTeamStats } from "@/lib/hooks";
import type { League } from "@/types/yahoo";

export default function DashboardPage() {
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

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
    data: teamStatsData,
    isLoading: loadingStats,
    error: statsError,
    refetch: refetchTeamStats,
  } = useTeamStats(selectedTeam);

  const leagues = leaguesData?.leagues || [];
  const teams = teamsData?.teams || [];
  const teamStats = teamStatsData?.team ?? null;

  if (loadingLeagues) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading leagues...</p>
        </div>
      </div>
    );
  }

  if (leaguesError && !leagues.length) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">
              {leaguesError instanceof Error
                ? leaguesError.message
                : "An error occurred"}
            </p>
            <Button onClick={() => refetchLeagues()} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Fantasy Basketball Dashboard</h1>
        <AuthButton />
      </div>

      {leagues.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No basketball leagues found. Make sure you&apos;re part of a Yahoo
              Fantasy Basketball league.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* League Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select League</CardTitle>
              <CardDescription>
                Choose a league to view team statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {leagues.map((league) => (
                  <Button
                    key={league.league_key}
                    variant={
                      selectedLeague?.league_key === league.league_key
                        ? "default"
                        : "outline"
                    }
                    onClick={() => {
                      setSelectedLeague(league);
                      setSelectedTeam(null); // Reset team selection when league changes
                    }}
                    className="justify-start"
                  >
                    {league.name} ({league.season})
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Selection */}
          {selectedLeague && (
            <Card>
              <CardHeader>
                <CardTitle>Select Team</CardTitle>
                <CardDescription>
                  {loadingTeams
                    ? "Loading teams..."
                    : "Choose a team to view statistics"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingTeams ? (
                  <p className="text-muted-foreground">Loading teams...</p>
                ) : teamsError ? (
                  <div>
                    <p className="text-destructive">
                      {teamsError instanceof Error
                        ? teamsError.message
                        : "Failed to fetch teams"}
                    </p>
                  </div>
                ) : teams.length === 0 ? (
                  <p className="text-muted-foreground">
                    Team selection coming soon. For now, you can view stats by
                    team key.
                  </p>
                ) : (
                  <div className="grid gap-2">
                    {teams.map((team) => (
                      <Button
                        key={team.team_key}
                        variant={
                          selectedTeam === team.team_key ? "default" : "outline"
                        }
                        onClick={() => setSelectedTeam(team.team_key)}
                        className="justify-start"
                      >
                        {team.name}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Team Stats */}
        </div>
      )}
    </div>
  );
}
