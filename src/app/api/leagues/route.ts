import { NextResponse } from 'next/server';
import { getUserLeagues } from '@/lib/yahoo-api';
import { getAccessTokenFromCookies, updateTokenCookies } from '@/lib/api-utils';

export async function GET() {
  try {
    const tokenResult = await getAccessTokenFromCookies();

    if (!tokenResult.accessToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const leagues = await getUserLeagues(tokenResult.accessToken);

    // Filter for basketball leagues (game_key = '414' for NBA)
    const basketballLeagues = leagues.filter((league) => {
      // Extract game_key from league_key (format: game_key.league_id)
      const gameKey = league.league_key.split('.')[0];
      return gameKey === '414'; // 414 is NBA
    });

    const response = NextResponse.json({ leagues: basketballLeagues });

    // Update cookies if token was refreshed
    if (tokenResult.refreshTokens) {
      updateTokenCookies(response, tokenResult.refreshTokens);
    }

    return response;
  } catch (error) {
    console.error('Error fetching leagues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leagues' },
      { status: 500 }
    );
  }
}

