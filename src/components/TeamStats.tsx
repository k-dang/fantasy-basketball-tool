'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { YahooTeamStats, YahooPlayer } from '@/types/yahoo';

interface TeamStatsProps {
  team: YahooTeamStats;
}

// Common fantasy basketball stat IDs (Yahoo-specific)
const STAT_LABELS: Record<string, string> = {
  '0': 'Games Played',
  '1': 'Games Started',
  '3': 'Minutes Played',
  '5': 'Field Goals Made',
  '6': 'Field Goals Attempted',
  '8': 'Free Throws Made',
  '9': 'Free Throws Attempted',
  '10': 'Three Pointers Made',
  '12': 'Points',
  '15': 'Offensive Rebounds',
  '16': 'Defensive Rebounds',
  '17': 'Total Rebounds',
  '18': 'Assists',
  '19': 'Steals',
  '20': 'Blocked Shots',
  '21': 'Turnovers',
  '22': 'Personal Fouls',
  '23': 'Field Goal Percentage',
  '24': 'Free Throw Percentage',
  '25': 'Three Point Percentage',
};

function formatStatValue(statId: string, value: string): string {
  // Format percentages
  if (['23', '24', '25'].includes(statId)) {
    return `${(parseFloat(value) * 100).toFixed(1)}%`;
  }
  // Format minutes
  if (statId === '3') {
    const minutes = parseFloat(value);
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }
  return value;
}

function getPlayerStats(player: YahooPlayer) {
  if (!player.stats) return [];
  
  return player.stats.map((stat) => ({
    label: STAT_LABELS[stat.stat_id] || `Stat ${stat.stat_id}`,
    value: formatStatValue(stat.stat_id, stat.value),
    statId: stat.stat_id,
  }));
}

function getTeamTotalStats(team: YahooTeamStats) {
  if (!team.stats) return [];
  
  return team.stats.map((stat) => ({
    label: STAT_LABELS[stat.stat_id] || `Stat ${stat.stat_id}`,
    value: formatStatValue(stat.stat_id, stat.value),
    statId: stat.stat_id,
  }));
}

export function TeamStats({ team }: TeamStatsProps) {
  const teamStats = getTeamTotalStats(team);
  const players = team.players || [];

  return (
    <div className="space-y-6">
      {/* Team Header */}
      <Card>
        <CardHeader>
          <CardTitle>{team.name}</CardTitle>
          {team.managers && team.managers.length > 0 && (
            <CardDescription>
              Manager: {team.managers.map((m) => m.nickname).join(', ')}
            </CardDescription>
          )}
        </CardHeader>
        {teamStats.length > 0 && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {teamStats.map((stat) => (
                <div key={stat.statId} className="space-y-1">
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Player Stats Table */}
      {players.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Roster</CardTitle>
            <CardDescription>Player statistics for this team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Player</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>PTS</TableHead>
                    <TableHead>REB</TableHead>
                    <TableHead>AST</TableHead>
                    <TableHead>STL</TableHead>
                    <TableHead>BLK</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {players.map((player) => {
                    const playerStats = getPlayerStats(player);
                    const statsMap = new Map(
                      playerStats.map((s) => [s.statId, s.value])
                    );

                    return (
                      <TableRow key={player.player_key}>
                        <TableCell className="font-medium">
                          {player.name.full}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{player.position}</Badge>
                        </TableCell>
                        <TableCell>
                          {player.status && (
                            <Badge
                              variant={
                                player.status === 'DTD'
                                  ? 'default'
                                  : player.status === 'O'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                            >
                              {player.status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{statsMap.get('12') || '-'}</TableCell>
                        <TableCell>{statsMap.get('17') || '-'}</TableCell>
                        <TableCell>{statsMap.get('18') || '-'}</TableCell>
                        <TableCell>{statsMap.get('19') || '-'}</TableCell>
                        <TableCell>{statsMap.get('20') || '-'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {players.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No player data available for this team.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

