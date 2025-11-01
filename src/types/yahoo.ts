export interface YahooUsersGamesLeaguesResponse {
  fantasy_content: FantasyContent;
}

export interface FantasyContent {
  users: Record<string, UserContainer>;
}

export interface UserContainer {
  user: User[];
  count?: number;
}

export interface User {
  guid?: string;
  games?: Omit<Record<string, GameContainer>, "count"> & {
    count: number;
  };
}

export interface GameContainer {
  game: [Game, GameLeagues];
}

export interface Game {
  game_key: string;
  game_id: string;
  name: string;
  season: string;
  is_game_over: number;
}

interface GameLeagues {
  leagues: LeaguesContainer;
}

export type LeaguesContainer = Omit<
  Record<string, LeagueContainer>,
  "count"
> & {
  count: number;
};

export interface LeagueContainer {
  league: League[];
}

export interface League {
  league_key: string;
  league_id: string;
  name: string;
  season: string;
}

export interface TeamLogo {
  size: string;
  url: string;
}

export interface TeamLogoContainer {
  team_logo: TeamLogo;
}

export interface RosterAdds {
  coverage_type: string;
  coverage_value: number;
  value: string;
}

export type TeamArrayElement = Record<string, unknown>;

export type TeamArray = TeamArrayElement[];

export interface TeamContainer {
  team: [TeamArray];
}

export interface TeamsContainer {
  teams: Omit<Record<string, TeamContainer>, "count"> & {
    count: number;
  };
}

export interface YahooLeagueTeamsResponse {
  fantasy_content: {
    league: [League, TeamsContainer];
  };
}

export interface YahooTeamStatsResponse {
  fantasy_content: {
    team: [TeamArray, TeamStats];
  };
}

export interface TeamStats {
  team_stats: {
    stats: Array<Stat>;
  };
}

export interface Stat {
  stat: {
    stat_id: string;
    value: string;
  };
}

export interface YahooTeamMatchupsResponse {
  fantasy_content: {
    team: [TeamArray, TeamMatchups];
  };
}

export interface TeamMatchups {
  matchups: MatchupsContainer;
}

export type MatchupsContainer = Omit<
  Record<string, MatchupContainer>,
  "count"
> & {
  count: number;
};

export interface MatchupContainer {
  matchup: Matchup[];
}

export interface Matchup {
  week?: string;
  week_start?: string;
  week_end?: string;
  status?: string;
  is_playoffs?: string;
  is_consolation?: string;
  is_tied?: string;
  winner_team_key?: string;
  teams?: Omit<Record<string, MatchupTeamContainer>, "count"> & {
    count: number;
  };
}

export interface MatchupTeamContainer {
  team: [TeamArray, MatchupTeamStats];
}

export interface MatchupTeamStats {
  team_stats: {
    coverage_type: string;
    week?: string;
    stats: Array<Stat>;
  };
}

export interface ParsedMatchup {
  week: string;
  week_start?: string;
  week_end?: string;
  status?: string;
  is_playoffs?: boolean;
  is_consolation?: boolean;
  is_tied?: boolean;
  winner_team_key?: string;
  team_stats?: Stat[];
  opponent_stats?: Stat[];
}