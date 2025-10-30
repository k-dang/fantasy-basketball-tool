export interface YahooTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt?: number;
}

export interface YahooUser {
  sub: string;
  email?: string;
  name?: string;
}

export interface YahooLeague {
  league_key: string;
  league_id: string;
  name: string;
  season: string;
  url: string;
  draft_status: string;
  num_teams: number;
}

export interface YahooTeam {
  team_key: string;
  team_id: string;
  name: string;
  manager_name?: string;
  url: string;
}

export interface YahooStat {
  stat_id: string;
  value: string;
}

export interface YahooPlayer {
  player_key: string;
  player_id: string;
  name: {
    full: string;
  };
  position: string;
  status: string;
  stats?: YahooStat[];
}

export interface YahooTeamStats {
  team_key: string;
  team_id: string;
  name: string;
  managers?: Array<{
    manager_id: string;
    nickname: string;
  }>;
  stats?: YahooStat[];
  players?: YahooPlayer[];
}

export interface YahooGame {
  game_key: string;
  game_id: string;
  name: string;
  code: string;
  type: string;
  url: string;
  season: string;
  leagues?: Array<{
    league: YahooLeague[];
  }>;
}

export interface YahooUserData {
  games: Array<{
    game: YahooGame[];
  }>;
}

export interface YahooUsersResponse {
  users: {
    [key: string]: YahooUserData[];
  };
}

export interface YahooApiResponse<T> {
  fantasy_content: {
    [key: string]: T;
  };
}
