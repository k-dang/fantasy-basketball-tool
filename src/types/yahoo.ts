// Yahoo Fantasy Sports API Types

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
}
