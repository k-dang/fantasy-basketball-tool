import { NextResponse } from "next/server";
import { getActiveUserLeagues } from "@/lib/yahoo-api";
import { getAccessTokenFromCookies, updateTokenCookies } from "@/lib/api-utils";

export async function GET() {
  try {
    const tokenResult = await getAccessTokenFromCookies();

    if (!tokenResult.accessToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const leagues = await getActiveUserLeagues(tokenResult.accessToken);

    const response = NextResponse.json({ leagues });

    if (tokenResult.refreshTokens) {
      updateTokenCookies(response, tokenResult.refreshTokens);
    }

    return response;
  } catch (error) {
    console.error("Error fetching leagues:", error);
    return NextResponse.json(
      { error: "Failed to fetch leagues" },
      { status: 500 }
    );
  }
}
