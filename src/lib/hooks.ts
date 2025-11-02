import { useQuery } from "@tanstack/react-query";
import type { League, Stat, ParsedMatchup } from "@/types/yahoo";

interface LeaguesResponse {
  leagues: Array<League>;
}

interface TeamsResponse {
  teams: Array<{ team_key: string; name: string }>;
}

interface TeamStatsResponse {
  stats: Array<Stat>;
}

interface TeamMatchupsResponse {
  matchups: Array<ParsedMatchup>;
}

export function useLeagues() {
  return useQuery<LeaguesResponse, Error>({
    queryKey: ["leagues"],
    queryFn: async () => {
      const response = await fetch("/api/leagues");

      if (!response.ok) {
        throw new Error(`Failed to fetch leagues: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    },
    retry: false,
  });
}

export function useTeams(leagueKey: string | null) {
  return useQuery<TeamsResponse, Error>({
    queryKey: ["teams", leagueKey],
    queryFn: async () => {
      if (!leagueKey) {
        throw new Error("League key is required");
      }

      const response = await fetch(`/api/leagues/${leagueKey}/teams`);

      if (!response.ok) {
        throw new Error(`Failed to fetch teams: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    },
    enabled: !!leagueKey,
    retry: false,
  });
}

/**
 * Hook to fetch stats for a specific team
 */
export function useTeamStats(teamKey: string | null) {
  return useQuery<TeamStatsResponse, Error>({
    queryKey: ["teamStats", teamKey],
    queryFn: async () => {
      const response = await fetch(`/api/teams/${teamKey}/stats`);

      if (!response.ok) {
        throw new Error(`Failed to fetch team stats: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    },
    enabled: !!teamKey,
    retry: false,
  });
}

export function useTeamMatchups(teamKey: string | null) {
  return useQuery<TeamMatchupsResponse, Error>({
    queryKey: ["teamMatchups", teamKey],
    queryFn: async () => {
      if (!teamKey) {
        throw new Error("Team key is required");
      }

      const response = await fetch(`/api/teams/${teamKey}/matchups`);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch team matchups: ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    },
    enabled: !!teamKey,
    retry: false,
  });
}
