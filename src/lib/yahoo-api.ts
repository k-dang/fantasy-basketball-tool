import type {
  YahooLeagueTeamsResponse,
  YahooTeamStatsResponse,
  YahooUsersGamesLeaguesResponse,
  YahooTeamMatchupsResponse,
  ParsedMatchup,
} from "@/types/yahoo";

const YAHOO_FANTASY_API_BASE = "https://fantasysports.yahooapis.com/fantasy/v2";

export async function getUserGamesLeagues(
  accessToken: string
): Promise<YahooUsersGamesLeaguesResponse> {
  const url = `${YAHOO_FANTASY_API_BASE}/users;use_login=1/games/leagues?format=json`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Yahoo API error: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

export async function getActiveUserLeagues(accessToken: string) {
  const data = await getUserGamesLeagues(accessToken);

  const games = data.fantasy_content.users[0].user[1].games;
  if (!games) {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { count: _1, ...gamesWithoutCount } = games;
  const justGames = Object.values(gamesWithoutCount).map((g) => g);
  const activeGames = justGames.filter((g) => g.game[0].is_game_over === 0);
  const activeLeagues = Object.values(
    activeGames.flatMap((g) => g.game[1].leagues)
  );

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { count: _2, ...activeLeaguesWithoutCount } = activeLeagues[0];
  const justLeagues = Object.values(activeLeaguesWithoutCount).map(
    (l) => l.league[0]
  );

  return justLeagues;
}

export async function getLeagueTeams(
  accessToken: string,
  leagueKey: string
): Promise<YahooLeagueTeamsResponse> {
  const url = `${YAHOO_FANTASY_API_BASE}/league/${leagueKey}/teams?format=json`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Yahoo API error: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

export async function getTeams(accessToken: string, leagueKey: string) {
  const data = await getLeagueTeams(accessToken, leagueKey);

  const teams = data.fantasy_content.league[1].teams;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { count: _1, ...teamsWithoutCount } = teams;

  const justTeams = Object.values(teamsWithoutCount).map((t) => ({
    team_key: t.team[0][0].team_key,
    name: t.team[0][2].name,
  }));

  return justTeams;
}

export async function getTeamStats(
  accessToken: string,
  teamKey: string
): Promise<YahooTeamStatsResponse> {
  const url = `${YAHOO_FANTASY_API_BASE}/team/${teamKey}/stats?format=json`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Yahoo API error: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

export async function getTeamRoster(accessToken: string, teamKey: string) {
  const url = `${YAHOO_FANTASY_API_BASE}/team/${teamKey}/roster/players/stats?format=json`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Yahoo API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  const teamData = data.fantasy_content?.team;
  const team = Array.isArray(teamData) ? teamData[0] : undefined;
  if (!team) {
    throw new Error("Team not found in response");
  }

  return team;
}

export async function getLeagueSettings(
  accessToken: string,
  leagueKey: string
) {
  const url = `${YAHOO_FANTASY_API_BASE}/league/${leagueKey}/settings?format=json`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Yahoo API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data.fantasy_content.league[1].settings[0];
}

export async function getTeamMatchups(
  accessToken: string,
  teamKey: string
): Promise<YahooTeamMatchupsResponse> {
  const url = `${YAHOO_FANTASY_API_BASE}/team/${teamKey}/matchups?format=json`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Yahoo API error: ${response.status} ${response.statusText}`
    );
  }

  return await response.json();
}

export function parseMatchups(
  matchupsData: YahooTeamMatchupsResponse,
  teamKey: string
): ParsedMatchup[] {
  const matchups = matchupsData.fantasy_content.team[1].matchups;
  const parsedMatchups: ParsedMatchup[] = [];

  if (matchups && typeof matchups === "object" && "count" in matchups) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { count: _count, ...matchupsWithoutCount } = matchups;
    const matchupEntries = Object.values(matchupsWithoutCount);

    for (const matchupContainer of matchupEntries) {
      if (matchupContainer?.matchup?.[0]) {
        const matchup = matchupContainer.matchup[0];
        const parsedMatchup: ParsedMatchup = {
          week: matchup.week || "",
          week_start: matchup.week_start,
          week_end: matchup.week_end,
          status: matchup.status,
          is_playoffs: matchup.is_playoffs === "1",
          is_consolation: matchup.is_consolation === "1",
          is_tied: matchup.is_tied === "1",
          winner_team_key: matchup.winner_team_key,
        };

        // Extract team stats from the matchup
        if (matchup.teams && typeof matchup.teams === "object" && "count" in matchup.teams) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { count: _teamsCount, ...teamsWithoutCount } = matchup.teams;
          const teamEntries = Object.values(teamsWithoutCount);
          
          for (const teamContainer of teamEntries) {
            if (teamContainer?.team?.[1]?.team_stats) {
              const teamStats = teamContainer.team[1].team_stats;
              // Try to get team key from various possible structures
              let teamKeyFromMatchup: string | undefined;
              if (Array.isArray(teamContainer.team[0])) {
                const teamData = teamContainer.team[0];
                const teamItem = teamData.find((item: unknown) => 
                  typeof item === 'object' && item !== null && 'team_key' in item
                ) as { team_key?: string } | undefined;
                teamKeyFromMatchup = teamItem?.team_key;
              } else if (teamContainer.team[0] && typeof teamContainer.team[0] === 'object' && 'team_key' in teamContainer.team[0]) {
                teamKeyFromMatchup = (teamContainer.team[0] as { team_key?: string }).team_key;
              }
              
              // Check if this is the selected team or opponent
              if (teamKeyFromMatchup === teamKey) {
                parsedMatchup.team_stats = teamStats.stats || [];
              } else if (!parsedMatchup.opponent_stats) {
                parsedMatchup.opponent_stats = teamStats.stats || [];
              }
            }
          }
        }

        parsedMatchups.push(parsedMatchup);
      }
    }
  }

  // Sort by week number
  parsedMatchups.sort((a, b) => {
    const weekA = parseInt(a.week) || 0;
    const weekB = parseInt(b.week) || 0;
    return weekA - weekB;
  });

  return parsedMatchups;
}
