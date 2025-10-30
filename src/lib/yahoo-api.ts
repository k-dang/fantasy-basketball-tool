import type {
  YahooLeague,
  YahooTeamStats,
  YahooApiResponse,
  YahooTeam,
  YahooUsersResponse,
} from "@/types/yahoo";

const YAHOO_FANTASY_API_BASE = "https://fantasysports.yahooapis.com/fantasy/v2";

/**
 * Helper to handle Yahoo API responses
 */
async function handleYahooResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    try {
      const errorText = await response.text();
      throw new Error(
        `Yahoo API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    } catch {
      throw new Error(
        `Yahoo API error: ${response.status} ${response.statusText}`
      );
    }
  }

  // Yahoo API might return XML by default, but we request JSON
  if (contentType.includes("application/json")) {
    return response.json() as Promise<T>;
  }

  // If we get XML, try to parse it or throw an error
  throw new Error(
    "Yahoo API returned XML instead of JSON. Add format=json query parameter."
  );
}

/**
 * Fetch user's fantasy leagues
 * Returns both the leagues array and the full response data
 */
export async function getUserLeagues(
  accessToken: string
): Promise<YahooLeague[]> {
  const data = await getUserLeaguesData(accessToken);
  console.log("Data:", JSON.stringify(data.fantasy_content));
  // Extract leagues from nested Yahoo API response structure
  const leagues: YahooLeague[] = [];
  const usersData = data.fantasy_content?.users;
  const users = Array.isArray(usersData) ? usersData[0]?.user : undefined;
  if (users) {
    for (const user of users) {
      const games = user.games?.[0]?.game;
      if (games) {
        for (const game of games) {
          const leaguesData = game.leagues?.[0]?.league;
          if (leaguesData && Array.isArray(leaguesData)) {
            leagues.push(...leaguesData);
          }
        }
      }
    }
  }

  return leagues;
}

/**
 * Fetch user's fantasy leagues data with full response structure
 * Allows access to games via data.fantasy_content.users[0].user[1].games
 */
export async function getUserLeaguesData(
  accessToken: string
): Promise<YahooApiResponse<YahooUsersResponse>> {
  const url = `${YAHOO_FANTASY_API_BASE}/users;use_login=1/games/leagues?format=json`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  const data = await handleYahooResponse<
    YahooApiResponse<YahooUsersResponse>
  >(response);
  
  return data;
}

/**
 * Fetch teams in a league
 */
export async function getLeagueTeams(
  accessToken: string,
  leagueKey: string
): Promise<YahooTeam[]> {
  const url = `${YAHOO_FANTASY_API_BASE}/league/${leagueKey}/teams?format=json`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  const data = await handleYahooResponse<
    YahooApiResponse<{
      league: Array<{
        teams: Array<{
          team: YahooTeam[];
        }>;
      }>;
    }>
  >(response);

  const teams: YahooTeam[] = [];
  const league = data.fantasy_content?.league;
  if (Array.isArray(league) && league[0]?.teams?.[0]?.team) {
    teams.push(...league[0].teams[0].team);
  }

  return teams;
}

/**
 * Fetch team statistics
 */
export async function getTeamStats(
  accessToken: string,
  teamKey: string
): Promise<YahooTeamStats> {
  const url = `${YAHOO_FANTASY_API_BASE}/team/${teamKey}/stats?format=json`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  const data = await handleYahooResponse<
    YahooApiResponse<{
      team: YahooTeamStats[];
    }>
  >(response);

  const teamData = data.fantasy_content?.team;
  const team = Array.isArray(teamData) ? teamData[0] : undefined;
  if (!team) {
    throw new Error("Team not found in response");
  }

  return team;
}

/**
 * Fetch team roster with player stats
 */
export async function getTeamRoster(
  accessToken: string,
  teamKey: string
): Promise<YahooTeamStats> {
  const url = `${YAHOO_FANTASY_API_BASE}/team/${teamKey}/roster/players/stats?format=json`;
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  const data = await handleYahooResponse<
    YahooApiResponse<{
      team: YahooTeamStats[];
    }>
  >(response);

  const teamData = data.fantasy_content?.team;
  const team = Array.isArray(teamData) ? teamData[0] : undefined;
  if (!team) {
    throw new Error("Team not found in response");
  }

  return team;
}
