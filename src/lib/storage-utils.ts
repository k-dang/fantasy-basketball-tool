import type { League } from "@/types/yahoo";

const STORAGE_KEYS = {
  SELECTED_LEAGUE: "fantasy-basketball-selected-league",
  SELECTED_TEAM: "fantasy-basketball-selected-team",
} as const;

/**
 * Save the selected league to local storage
 */
export function saveLeagueSelection(league: League | null): void {
  try {
    if (league === null) {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_LEAGUE);
    } else {
      localStorage.setItem(
        STORAGE_KEYS.SELECTED_LEAGUE,
        JSON.stringify({
          league_key: league.league_key,
          league_id: league.league_id,
          name: league.name,
          season: league.season,
        })
      );
    }
  } catch (error) {
    console.error("Failed to save league selection:", error);
  }
}

/**
 * Load the selected league from local storage
 */
export function loadLeagueSelection(): League | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_LEAGUE);
    if (!stored) return null;

    const league = JSON.parse(stored) as League;
    // Validate that it has the required fields
    if (
      league &&
      typeof league === "object" &&
      "league_key" in league &&
      "name" in league &&
      "season" in league
    ) {
      return league;
    }
    return null;
  } catch (error) {
    console.error("Failed to load league selection:", error);
    return null;
  }
}

/**
 * Save the selected team key to local storage
 */
export function saveTeamSelection(teamKey: string | null): void {
  try {
    if (teamKey === null) {
      localStorage.removeItem(STORAGE_KEYS.SELECTED_TEAM);
    } else {
      localStorage.setItem(STORAGE_KEYS.SELECTED_TEAM, teamKey);
    }
  } catch (error) {
    console.error("Failed to save team selection:", error);
  }
}

/**
 * Load the selected team key from local storage
 */
export function loadTeamSelection(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.SELECTED_TEAM);
  } catch (error) {
    console.error("Failed to load team selection:", error);
    return null;
  }
}

/**
 * Clear all saved selections from local storage
 */
export function clearSelections(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.SELECTED_LEAGUE);
    localStorage.removeItem(STORAGE_KEYS.SELECTED_TEAM);
  } catch (error) {
    console.error("Failed to clear selections:", error);
  }
}
