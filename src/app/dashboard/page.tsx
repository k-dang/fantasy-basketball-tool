'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TeamStats } from '@/components/TeamStats';
import { AuthButton } from '@/components/AuthButton';
import type { YahooLeague, YahooTeamStats } from '@/types/yahoo';

interface LeagueWithTeams extends YahooLeague {
  teams?: Array<{
    team_key: string;
    team_id: string;
    name: string;
  }>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [leagues, setLeagues] = useState<YahooLeague[]>([]);
  const [selectedLeague, setSelectedLeague] = useState<YahooLeague | null>(null);
  const [teams, setTeams] = useState<Array<{ team_key: string; name: string }>>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [teamStats, setTeamStats] = useState<YahooTeamStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeagues();
  }, []);

  useEffect(() => {
    if (selectedLeague) {
      fetchTeams(selectedLeague.league_key);
    }
  }, [selectedLeague]);

  useEffect(() => {
    if (selectedTeam) {
      fetchTeamStats(selectedTeam);
    }
  }, [selectedTeam]);

  async function fetchLeagues() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/leagues');

      if (!response.ok) {
        if (response.status === 401) {
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch leagues');
      }

      const data = await response.json();
      setLeagues(data.leagues || []);

      // Auto-select first league if available
      if (data.leagues && data.leagues.length > 0) {
        setSelectedLeague(data.leagues[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function fetchTeams(leagueKey: string) {
    try {
      setLoadingTeams(true);
      setError(null);
      const response = await fetch(`/api/leagues/${leagueKey}/teams`);
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push('/');
          return;
        }
        throw new Error('Failed to fetch teams');
      }

      const data = await response.json();
      setTeams(data.teams || []);
    } catch (err) {
      console.error('Error fetching teams:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch teams');
      setTeams([]);
    } finally {
      setLoadingTeams(false);
    }
  }

  async function fetchTeamStats(teamKey: string) {
    try {
      setLoadingStats(true);
      setError(null);
      const response = await fetch(`/api/teams/${teamKey}/stats`);

      if (!response.ok) {
        throw new Error('Failed to fetch team stats');
      }

      const data = await response.json();
      setTeamStats(data.team);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoadingStats(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading leagues...</p>
        </div>
      </div>
    );
  }

  if (error && !leagues.length) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchLeagues} className="mt-4">
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
              No basketball leagues found. Make sure you're part of a Yahoo Fantasy Basketball league.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* League Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select League</CardTitle>
              <CardDescription>Choose a league to view team statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {leagues.map((league) => (
                  <Button
                    key={league.league_key}
                    variant={selectedLeague?.league_key === league.league_key ? 'default' : 'outline'}
                    onClick={() => setSelectedLeague(league)}
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
                  {loadingTeams ? 'Loading teams...' : 'Choose a team to view statistics'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingTeams ? (
                  <p className="text-muted-foreground">Loading teams...</p>
                ) : teams.length === 0 ? (
                  <p className="text-muted-foreground">
                    Team selection coming soon. For now, you can view stats by team key.
                  </p>
                ) : (
                  <div className="grid gap-2">
                    {teams.map((team) => (
                      <Button
                        key={team.team_key}
                        variant={selectedTeam === team.team_key ? 'default' : 'outline'}
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
          {selectedTeam && (
            <div>
              {loadingStats ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">Loading team statistics...</p>
                  </CardContent>
                </Card>
              ) : teamStats ? (
                <TeamStats team={teamStats} />
              ) : error ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-destructive">{error}</p>
                    <Button onClick={() => fetchTeamStats(selectedTeam)} className="mt-4">
                      Try Again
                    </Button>
                  </CardContent>
                </Card>
              ) : null}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

