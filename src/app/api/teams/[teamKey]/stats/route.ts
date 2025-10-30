import { NextRequest, NextResponse } from 'next/server';
import { getTeamStats, getTeamRoster } from '@/lib/yahoo-api';
import { getAccessTokenFromCookies, updateTokenCookies } from '@/lib/api-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamKey: string }> }
) {
  try {
    const tokenResult = await getAccessTokenFromCookies();

    if (!tokenResult.accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { teamKey: paramTeamKey } = await params;
    const searchParams = request.nextUrl.searchParams;
    const teamKey = searchParams.get('teamKey') || paramTeamKey;

    if (!teamKey) {
      return NextResponse.json(
        { error: 'Team key is required' },
        { status: 400 }
      );
    }

    // Fetch both team stats and roster
    const [teamStats, teamRoster] = await Promise.all([
      getTeamStats(tokenResult.accessToken, teamKey),
      getTeamRoster(tokenResult.accessToken, teamKey),
    ]);

    // Merge roster players into team stats
    const teamWithRoster = {
      ...teamStats,
      players: teamRoster.players || [],
    };

    const response = NextResponse.json({ team: teamWithRoster });

    // Update cookies if token was refreshed
    if (tokenResult.refreshTokens) {
      updateTokenCookies(response, tokenResult.refreshTokens);
    }

    return response;
  } catch (error) {
    console.error('Error fetching team stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team stats' },
      { status: 500 }
    );
  }
}

