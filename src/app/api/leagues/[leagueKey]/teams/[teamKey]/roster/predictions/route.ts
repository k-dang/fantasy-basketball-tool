import { NextRequest, NextResponse } from "next/server";
import {
  getLeagueSettings,
  getStatCategories,
  getTeamRosterPlayers,
} from "@/lib/yahoo-api";
import { getAccessTokenFromCookies, updateTokenCookies } from "@/lib/api-utils";
import {
  predictNextWeekStats,
  adjustForInjuryStatus,
} from "@/lib/prediction-utils";
import type {
  PlayerPrediction,
  PlayerPredictedStat,
  PlayerPredictionsResponse,
  PlayerWeeklyStats,
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
    const targetWeek = currentWeek + 1;

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
        status: string | undefined;
        status_full: string | undefined;
        weeklyStats: Map<
          number,
          { week: number; stats: Array<{ stat_id: string; value: string }> }
        >;
      }
    >();

    // Populate the map with weekly data
    for (const { week, roster } of weeklyRosters) {
      for (const player of roster) {
        const playerKey = player.name || `unknown-${Math.random()}`;

        if (!playerMap.has(playerKey)) {
          playerMap.set(playerKey, {
            name: player.name,
            image_url: player.image_url,
            status: player.status,
            status_full: player.status_full,
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

    // Create stat order map from actual roster data
    const statOrderMap = new Map<string, number>();
    if (weeklyRosters.length > 0 && weeklyRosters[0].roster.length > 0) {
      const firstPlayerStats = weeklyRosters[0].roster[0].stats;
      firstPlayerStats.forEach((stat, index) => {
        statOrderMap.set(stat.stat_id, index);
      });
    }

    // Calculate predictions for each player
    const rosterPredictions: PlayerPrediction[] = [];

    for (const [, playerData] of playerMap.entries()) {
      const rawWeeklyStats = Array.from(playerData.weeklyStats.values()).sort(
        (a, b) => a.week - b.week
      );

      // Convert to PlayerWeeklyStats format for prediction utilities
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

      // Get all unique stat IDs across all weeks
      const statIdSet = new Set<string>();
      for (const weeklyStats of rawWeeklyStats) {
        for (const stat of weeklyStats.stats) {
          statIdSet.add(stat.stat_id);
        }
      }

      // Check if player has sufficient data (at least 2 weeks)
      const hasSufficientData = rawWeeklyStats.length >= 2;

      // Calculate predicted stats for each stat ID
      const predictedStats: PlayerPredictedStat[] = [];

      for (const statId of statIdSet) {
        const displayName = statCategories[statId]?.display_name || "";

        if (!hasSufficientData) {
          // Insufficient data - set all values to null
          predictedStats.push({
            stat_id: statId,
            display_name: displayName,
            predicted_value: null,
            confidence_interval: null,
            trend: "stable",
          });
        } else {
          // Calculate prediction
          const prediction = predictNextWeekStats(weeklyStatsArray, statId);

          // Adjust for injury status
          const adjustedValue = adjustForInjuryStatus(
            prediction.predictedValue,
            playerData.status
          );

          predictedStats.push({
            stat_id: statId,
            display_name: displayName,
            predicted_value: adjustedValue,
            confidence_interval: prediction.confidenceInterval,
            trend: prediction.trend,
          });
        }
      }

      // Sort predicted stats by stat order
      predictedStats.sort((a, b) => {
        const aIndex = statOrderMap.get(a.stat_id);
        const bIndex = statOrderMap.get(b.stat_id);

        if (aIndex === undefined && bIndex === undefined) {
          return a.stat_id.localeCompare(b.stat_id);
        }
        if (aIndex === undefined) return 1;
        if (bIndex === undefined) return -1;

        return aIndex - bIndex;
      });

      rosterPredictions.push({
        name: playerData.name,
        image_url: playerData.image_url,
        status: playerData.status,
        status_full: playerData.status_full,
        predicted_stats: predictedStats,
        has_sufficient_data: hasSufficientData,
      });
    }

    const response = NextResponse.json({
      roster: rosterPredictions,
      target_week: targetWeek,
    } satisfies PlayerPredictionsResponse);

    // Update cookies if token was refreshed
    if (tokenResult.refreshTokens) {
      updateTokenCookies(response, tokenResult.refreshTokens);
    }

    return response;
  } catch (error) {
    console.error("Error fetching team roster predictions:", error);
    return NextResponse.json(
      { error: "Failed to fetch team roster predictions" },
      { status: 500 }
    );
  }
}

