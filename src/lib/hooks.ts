import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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

interface AuthCheckResponse {
  authenticated: boolean;
}

/**
 * Simple hook to check authentication status by checking cookies via API
 */
export function useAuth() {
  const { data, isLoading, refetch } = useQuery<AuthCheckResponse, Error>({
    queryKey: ["auth"],
    queryFn: async () => {
      const response = await fetch("/api/auth/check");
      if (!response.ok) {
        throw new Error("Failed to check authentication");
      }
      return response.json();
    },
    retry: false,
  });

  return {
    isAuthenticated: data?.authenticated ?? false,
    isLoading,
    checkAuth: async () => {
      await refetch();
    },
  };
}

/**
 * Hook to fetch user's leagues
 */
export function useLeagues() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  return useQuery<LeaguesResponse, Error>({
    queryKey: ["leagues"],
    queryFn: async () => {
      const response = await fetch("/api/leagues");

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/");
          throw new Error("Unauthorized");
        }
        throw new Error("Failed to fetch leagues");
      }

      const data = await response.json();
      return data;
    },
    enabled: isAuthenticated && !authLoading,
    retry: false,
  });
}

/**
 * Hook to fetch teams for a specific league
 */
export function useTeams(leagueKey: string | null) {
  const router = useRouter();

  return useQuery<TeamsResponse, Error>({
    queryKey: ["teams", leagueKey],
    queryFn: async () => {
      if (!leagueKey) {
        throw new Error("League key is required");
      }

      const response = await fetch(`/api/leagues/${leagueKey}/teams`);

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/");
          throw new Error("Unauthorized");
        }
        throw new Error("Failed to fetch teams");
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
      if (!teamKey) {
        throw new Error("Team key is required");
      }

      const response = await fetch(`/api/teams/${teamKey}/stats`);

      if (!response.ok) {
        throw new Error("Failed to fetch team stats");
      }

      const data = await response.json();
      return data;
    },
    enabled: !!teamKey,
    retry: false,
  });
}

/**
 * Hook to fetch matchups for a specific team
 */
export function useTeamMatchups(teamKey: string | null) {
  const router = useRouter();

  return useQuery<TeamMatchupsResponse, Error>({
    queryKey: ["teamMatchups", teamKey],
    queryFn: async () => {
      if (!teamKey) {
        throw new Error("Team key is required");
      }

      const response = await fetch(`/api/teams/${teamKey}/matchups`);

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/");
          throw new Error("Unauthorized");
        }
        throw new Error("Failed to fetch team matchups");
      }

      const data = await response.json();
      return data;
    },
    enabled: !!teamKey,
    retry: false,
  });
}
