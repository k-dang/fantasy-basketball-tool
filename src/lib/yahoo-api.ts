import type {
  YahooLeagueTeamsResponse,
  YahooTeamStatsResponse,
  YahooUsersGamesLeaguesResponse,
  YahooTeamMatchupsResponse,
  ParsedMatchup,
  YahooLeagueSettingsResponse,
  StatCategory,
  YahooTeamRosterPlayersStatsResponse,
  StatContainer,
  PlayerArrayElement,
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

export async function getTeamRosterPlayersStats(
  accessToken: string,
  teamKey: string,
  week?: number
): Promise<YahooTeamRosterPlayersStatsResponse> {
  let url = `${YAHOO_FANTASY_API_BASE}/team/${teamKey}/roster/players/stats`;
  if (typeof week === "number") {
    url += `;type=week;week=${week}`;
  }
  url += `?format=json`;

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

export async function getTeamRosterPlayers(
  accessToken: string,
  teamKey: string,
  week?: number
) {
  const data = await getTeamRosterPlayersStats(accessToken, teamKey, week);

  const players = data.fantasy_content.team[1].roster[0].players;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { count: _1, ...playersWithoutCount } = players;

  const playersSubset = Object.values(playersWithoutCount).map(({ player }) => {
    let name: string | undefined;
    let image_url: string | undefined;
    let playerStats: StatContainer[] = [];

    for (const obj of player[0] as Array<PlayerArrayElement>) {
      if (obj.name && typeof obj.name.full === "string") {
        name = obj.name.full;
      }
      if (obj.image_url && typeof obj.image_url === "string") {
        image_url = obj.image_url;
      }
    }

    // Find the object with player_stats field
    for (const item of player) {
      if (
        item &&
        typeof item === "object" &&
        "player_stats" in item &&
        item.player_stats &&
        typeof item.player_stats === "object" &&
        "stats" in item.player_stats
      ) {
        playerStats = item.player_stats.stats as StatContainer[];
        break;
      }
    }

    const stats = playerStats.map((stat) => ({
      stat_id: stat.stat.stat_id,
      value: stat.stat.value,
    }));

    return {
      name: name,
      image_url: image_url,
      stats: stats,
    };
  });
  return playersSubset;
}

export async function getLeagueSettings(
  accessToken: string,
  leagueKey: string
): Promise<YahooLeagueSettingsResponse> {
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

  return await response.json();
}

export function getStatCategories(leagueSettings: YahooLeagueSettingsResponse) {
  const result: Record<string, StatCategory> = {};
  for (const statCategory of leagueSettings.fantasy_content.league[1]
    .settings[0].stat_categories.stats) {
    result[statCategory.stat.stat_id] = {
      stat_id: statCategory.stat.stat_id,
      name: statCategory.stat.name,
      display_name: statCategory.stat.display_name,
    };
  }
  return result;
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
  statCategories: Record<string, StatCategory>
): ParsedMatchup[] {
  const matchups = matchupsData.fantasy_content.team[1].matchups;
  const parsedMatchups = [];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { count: _1, ...matchupsWithoutCount } = matchups;

  for (const { matchup } of Object.values(matchupsWithoutCount)) {
    const teamStats = matchup[0].teams[0].team[1].team_stats.stats.map(
      (stat) => ({
        stat: {
          stat_id: stat.stat.stat_id,
          value: stat.stat.value,
          display_name: statCategories[stat.stat.stat_id].display_name,
        },
      })
    );
    const opponentStats = matchup[0].teams[1].team[1].team_stats.stats.map(
      (stat) => ({
        stat: {
          stat_id: stat.stat.stat_id,
          value: stat.stat.value,
          display_name: statCategories[stat.stat.stat_id].display_name,
        },
      })
    );
    const parsedMatchup = {
      week: parseInt(matchup.week as string),
      week_start: matchup.week_start,
      week_end: matchup.week_end,
      status: matchup.status,
      winner_team_key: matchup.winner_team_key,
      team_stats: teamStats,
      opponent_stats: opponentStats,
    };

    parsedMatchups.push(parsedMatchup);
  }

  // Sort by week number
  parsedMatchups.sort((a, b) => {
    return a.week - b.week;
  });

  return parsedMatchups;
}
