import { NextRequest, NextResponse } from 'next/server';
import { getLeagueTeams } from '@/lib/yahoo-api';
import { getAccessTokenFromCookies, updateTokenCookies } from '@/lib/api-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ leagueKey: string }> }
) {
  try {
    const tokenResult = await getAccessTokenFromCookies();

    if (!tokenResult.accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { leagueKey } = await params;
    const teams = await getLeagueTeams(tokenResult.accessToken, leagueKey);

    const response = NextResponse.json({ teams });

    // Update cookies if token was refreshed
    if (tokenResult.refreshTokens) {
      updateTokenCookies(response, tokenResult.refreshTokens);
    }

    return response;
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}

