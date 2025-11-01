import { NextRequest, NextResponse } from "next/server";
import { getTeamMatchups, parseMatchups } from "@/lib/yahoo-api";
import { getAccessTokenFromCookies, updateTokenCookies } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamKey: string }> }
) {
  try {
    const tokenResult = await getAccessTokenFromCookies();

    if (!tokenResult.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { teamKey: paramTeamKey } = await params;
    const searchParams = request.nextUrl.searchParams;
    const teamKey = searchParams.get("teamKey") || paramTeamKey;

    if (!teamKey) {
      return NextResponse.json(
        { error: "Team key is required" },
        { status: 400 }
      );
    }

    // Fetch team matchups
    const matchupsData = await getTeamMatchups(tokenResult.accessToken, teamKey);
    const parsedMatchups = parseMatchups(matchupsData, teamKey);

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

