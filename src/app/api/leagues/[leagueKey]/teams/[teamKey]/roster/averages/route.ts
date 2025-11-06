import { NextRequest, NextResponse } from "next/server";
import {
  getLeagueSettings,
  getStatCategories,
  getTeamRosterPlayers,
} from "@/lib/yahoo-api";
import { getAccessTokenFromCookies, updateTokenCookies } from "@/lib/api-utils";
import {
  calculateAverage,
  calculateMin,
  calculateMax,
  calculateStandardDeviation,
} from "@/lib/stat-utils";
import type {
  PlayerWeeklyAveragesResponse,
  PlayerWeeklyAverages,
  PlayerWeeklyStats,
  PlayerAggregatedStat,
} from "@/types/yahoo";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leagueKey: string; teamKey: string }> }
) {
  try {
    const tokenResult = await getAccessTokenFromCookies();

    if (!tokenResult.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { leagueKey, teamKey } = await params;

    if (!teamKey) {
      return NextResponse.json(
        { error: "Team key is required" },
        { status: 400 }
      );
    }

    // Get league settings to determine current week
    const leagueSettings = await getLeagueSettings(
      tokenResult.accessToken,
      leagueKey
    );
    const currentWeek =
      leagueSettings.fantasy_content.league[0].current_week;
    const statCategories = getStatCategories(leagueSettings);

    // Fetch roster stats for all weeks up to current week (inclusive)
    const weekPromises = [];
    for (let week = 1; week <= currentWeek; week++) {
      weekPromises.push(
        getTeamRosterPlayers(tokenResult.accessToken, teamKey, week).then(
          (roster) => ({ week, roster })
        )
      );
    }

    const weeklyRosters = await Promise.all(weekPromises);

    // Group players by name (assuming name is unique identifier)
    // Create a map of player name -> weekly stats
    const playerMap = new Map<
      string,
      {
        name: string | undefined;
        image_url: string | undefined;
        weeklyStats: Map<
          number,
          { week: number; stats: Array<{ stat_id: string; value: string }> }
        >;
      }
    >();

    // Populate the map with weekly data (without enhancement)
    for (const { week, roster } of weeklyRosters) {
      for (const player of roster) {
        const playerKey = player.name || `unknown-${Math.random()}`;
        
        if (!playerMap.has(playerKey)) {
          playerMap.set(playerKey, {
            name: player.name,
            image_url: player.image_url,
            weeklyStats: new Map(),
          });
        }

        const playerData = playerMap.get(playerKey)!;
        playerData.weeklyStats.set(week, {
          week,
          stats: player.stats.map((stat) => ({
            stat_id: stat.stat_id,
            value: stat.value,
          })),
        });
      }
    }

    // Calculate aggregated stats for each player
    const rosterAverages: PlayerWeeklyAverages[] = [];

    for (const [, playerData] of playerMap.entries()) {
      const rawWeeklyStats = Array.from(playerData.weeklyStats.values()).sort(
        (a, b) => a.week - b.week
      );

      // Get all unique stat IDs across all weeks
      const statIdSet = new Set<string>();
      for (const weeklyStats of rawWeeklyStats) {
        for (const stat of weeklyStats.stats) {
          statIdSet.add(stat.stat_id);
        }
      }

      // Calculate aggregated stats for each stat ID
      const aggregatedStats: PlayerAggregatedStat[] = [];

      for (const statId of statIdSet) {
        // Get all values for this stat across all weeks
        const values: string[] = [];
        for (const weeklyStats of rawWeeklyStats) {
          const stat = weeklyStats.stats.find((s) => s.stat_id === statId);
          if (stat) {
            values.push(stat.value);
          }
        }

        // Get display name from stat categories
        const displayName = statCategories[statId]?.display_name || "";

        // Calculate statistics
        const average = calculateAverage(values);
        const min = calculateMin(values);
        const max = calculateMax(values);
        const standardDeviation = calculateStandardDeviation(values);

        aggregatedStats.push({
          stat_id: statId,
          display_name: displayName,
          average,
          min,
          max,
          standard_deviation: standardDeviation,
        });
      }

      // Sort aggregated stats by stat_id for consistency
      aggregatedStats.sort((a, b) => parseInt(a.stat_id) - parseInt(b.stat_id));

      // Enhance weekly stats with display names once at the end
      const weeklyStatsArray: PlayerWeeklyStats[] = rawWeeklyStats.map(
        (rawStats) => ({
          week: rawStats.week,
          stats: rawStats.stats.map((stat) => ({
            stat_id: stat.stat_id,
            value: stat.value,
            display_name: statCategories[stat.stat_id]?.display_name || "",
          })),
        })
      );

      rosterAverages.push({
        name: playerData.name,
        image_url: playerData.image_url,
        weekly_stats: weeklyStatsArray,
        aggregated_stats: aggregatedStats,
      });
    }

    const response = NextResponse.json({ roster: rosterAverages });

    // Update cookies if token was refreshed
    if (tokenResult.refreshTokens) {
      updateTokenCookies(response, tokenResult.refreshTokens);
    }

    return response;
  } catch (error) {
    console.error("Error fetching team roster averages:", error);
    return NextResponse.json(
      { error: "Failed to fetch team roster averages" },
      { status: 500 }
    );
  }
}

