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
            league: Array<{
              league_key: string;
              league_id: string;
              name: string;
              season: string;
            }>;
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
                      Array<PlayerArrayElement>,
                      unknown,
                      unknown,
                      { player_stats: { stats: Array<StatContainer> } }
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
