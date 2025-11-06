import { NextRequest, NextResponse } from "next/server";
import {
  enhanceTeamRosterPlayers,
  getLeagueSettings,
  getStatCategories,
  getTeamRosterPlayers,
} from "@/lib/yahoo-api";
import { getAccessTokenFromCookies, updateTokenCookies } from "@/lib/api-utils";

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
    const { searchParams } = new URL(request.url);
    const weekParam = searchParams.get("week");
    const week = weekParam ? parseInt(weekParam, 10) : undefined;

    if (!teamKey) {
      return NextResponse.json(
        { error: "Team key is required" },
        { status: 400 }
      );
    }

    if (week !== undefined && (isNaN(week) || week < 1)) {
      return NextResponse.json(
        { error: "Week must be a positive number" },
        { status: 400 }
      );
    }

    const [leagueSettings, rosterData] = await Promise.all([
      getLeagueSettings(tokenResult.accessToken, leagueKey),
      getTeamRosterPlayers(tokenResult.accessToken, teamKey, week),
    ]);

    const statCategories = getStatCategories(leagueSettings);
    const enhancedRoster = enhanceTeamRosterPlayers(rosterData, statCategories);

    const response = NextResponse.json({ roster: enhancedRoster });

    // Update cookies if token was refreshed
    if (tokenResult.refreshTokens) {
      updateTokenCookies(response, tokenResult.refreshTokens);
    }

    return response;
  } catch (error) {
    console.error("Error fetching team roster:", error);
    return NextResponse.json(
      { error: "Failed to fetch team roster" },
      { status: 500 }
    );
  }
}
