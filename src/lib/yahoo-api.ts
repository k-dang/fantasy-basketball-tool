import type { YahooUsersGamesLeaguesResponse } from "@/types/yahoo";

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

  return response.json();
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

export async function getLeagueTeams(accessToken: string, leagueKey: string) {
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

  const data = await response.json();
  const league = data.fantasy_content?.league[1].teams;

  const teams =
    Object.values(league)
      .filter((teams) => typeof teams === "object")
      .map((json) => ({
        team_key: json?.team[0][0].team_key,
        name: json?.team[0][2].name,
      })) ?? [];

  return teams ?? [];
}

export async function getTeamStats(accessToken: string, teamKey: string) {
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

  const data = await response.json();
  const teamData = data.fantasy_content?.team;
  const team = Array.isArray(teamData) ? teamData[0] : undefined;
  if (!team) {
    throw new Error("Team not found in response");
  }

  return team;
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
