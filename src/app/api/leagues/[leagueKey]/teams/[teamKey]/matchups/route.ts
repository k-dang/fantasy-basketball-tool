import { NextRequest, NextResponse } from "next/server";
import {
  getLeagueSettings,
  getStatCategories,
  getTeamMatchups,
  parseMatchups,
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

    if (!teamKey) {
      return NextResponse.json(
        { error: "Team key is required" },
        { status: 400 }
      );
    }

    if (!leagueKey) {
      return NextResponse.json(
        { error: "League key is required" },
        { status: 400 }
      );
    }

    // Fetch league settings and team matchups in parallel
    const [leagueSettings, matchupsData] = await Promise.all([
      getLeagueSettings(tokenResult.accessToken, leagueKey),
      getTeamMatchups(tokenResult.accessToken, teamKey),
    ]);

    const statCategories = getStatCategories(leagueSettings);
    const parsedMatchups = parseMatchups(matchupsData, statCategories);

    const response = NextResponse.json({ matchups: parsedMatchups });

    // Update cookies if token was refreshed
    if (tokenResult.refreshTokens) {
      updateTokenCookies(response, tokenResult.refreshTokens);
    }

    return response;
  } catch (error) {
    console.error("Error fetching team matchups:", error);
    return NextResponse.json(
      { error: "Failed to fetch team matchups" },
      { status: 500 }
    );
  }
}
