export interface YahooUsersGamesLeaguesResponse {
  fantasy_content: {
    users: Record<
      string,
      {
        user: Array<{
          guid?: string;
          games?: Omit<Record<string, GameContainer>, "count"> & {
            count: number;
          };
        }>;
        count?: number;
      }
    >;
  };
}

interface GameContainer {
  game: [
    {
      game_key: string;
      game_id: string;
      name: string;
      season: string;
      is_game_over: number;
    },
    {
      leagues: Omit<
        Record<
          string,
          {
            league: Array<League>;
          }
        >,
        "count"
      > & {
        count: number;
      };
    }
  ];
}

export interface League {
  league_key: string;
  league_id: string;
  name: string;
  season: string;
  matchup_week: number;
  current_week: number;
  start_date: string;
  end_date: string;
  start_week: string;
  end_week: string;
}

type TeamArrayElement = Record<string, unknown>;

interface TeamContainer {
  team: [Array<TeamArrayElement>];
}

export interface YahooLeagueTeamsResponse {
  fantasy_content: {
    league: [
      League,
      {
        teams: Omit<Record<string, TeamContainer>, "count"> & {
          count: number;
        };
      }
    ];
  };
}

export interface YahooTeamStatsResponse {
  fantasy_content: {
    team: [
      Array<TeamArrayElement>,
      {
        team_stats: {
          stats: Array<StatContainer>;
        };
      }
    ];
  };
}

export interface StatContainer {
  stat: Stat;
}

interface Stat {
  stat_id: string;
  value: string;
}

interface ExtendedStat extends Stat {
  display_name: string;
}

export interface YahooTeamMatchupsResponse {
  fantasy_content: {
    team: [
      Array<TeamArrayElement>,
      {
        matchups: Omit<Record<string, MatchupContainer>, "count"> & {
          count: number;
        };
      }
    ];
  };
}

interface MatchupContainer {
  matchup: {
    week: number | string;
    week_start: string;
    week_end: string;
    status: string;
    winner_team_key: string;
    0: {
      teams: {
        0: MatchupTeamStatsContainer;
        1: MatchupTeamStatsContainer;
      };
    };
  };
}

interface MatchupTeamStatsContainer {
  team: [
    Array<TeamArrayElement>,
    {
      team_stats: {
        stats: Array<StatContainer>;
      };
    }
  ];
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

export interface YahooTeamRosterPlayersStatsResponse {
  fantasy_content: {
    team: [
      Array<TeamArrayElement>,
      {
        roster: {
          0: {
            players:
              | Record<
                  string,
                  {
                    player: [
                      | Array<PlayerArrayElement>
                      | { player_stats: { stats: Array<StatContainer> } }
                      | unknown
                    ];
                  }
                >
              | { count: number };
          };
        };
      }
    ];
  };
}

export type PlayerArrayElement = {
  name?: { full: string };
  headshot?: { url: string };
  image_url?: string;
} & Record<string, unknown>;

// TODO move these
// Types for weekly roster averages
export interface PlayerWeeklyStat {
  stat_id: string;
  value: string;
  display_name: string;
}

export interface PlayerWeeklyStats {
  week: number;
  stats: PlayerWeeklyStat[];
}

export interface PlayerAggregatedStat {
  stat_id: string;
  display_name: string;
  average: number | null;
  min: number | null;
  max: number | null;
  standard_deviation: number | null;
}

export interface PlayerWeeklyAverages {
  name: string | undefined;
  image_url: string | undefined;
  weekly_stats: PlayerWeeklyStats[];
  aggregated_stats: PlayerAggregatedStat[];
}

export interface PlayerWeeklyAveragesResponse {
  roster: PlayerWeeklyAverages[];
}