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
    stats: Array<StatContainer>;
  };
}

export interface StatContainer {
  stat: Stat;
}

export interface Stat {
  stat_id: string;
  value: string;
}

export interface ExtendedStat extends Stat {
  display_name: string;
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
  matchup: Matchup;
}

export interface Matchup {
  week: number | string;
  week_start: string;
  week_end: string;
  status: string;
  winner_team_key: string;
  0: MatchupTeamContainer;
}

export interface MatchupTeamContainer {
  teams: MatchupTeam;
}

export interface MatchupTeam {
  0: MatchupTeamStatsContainer;
  1: MatchupTeamStatsContainer;
}

export interface MatchupTeamStatsContainer {
  team: [TeamArray, MatchupTeamStats];
}

export interface MatchupTeamStats {
  team_stats: {
    stats: Array<StatContainer>;
  };
}

export interface ParsedMatchup {
  week: number;
  week_start: string;
  week_end: string;
  status: string;
  winner_team_key: string;
  team_stats?: Array<{ stat: ExtendedStat }>;
  opponent_stats?: Array<{ stat: ExtendedStat }>;
}

export interface YahooLeagueSettingsResponse {
  fantasy_content: {
    league: [
      League,
      {
        settings: Array<{
          stat_categories: {
            stats: Array<{
              stat: StatCategory;
            }>;
          };
        }>;
      }
    ];
  };
}

export interface StatCategory {
  stat_id: string;
  name: string;
  display_name: string;
}
