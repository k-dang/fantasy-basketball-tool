import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { refreshAccessToken } from '@/lib/auth';

export interface TokenResult {
  accessToken: string | null;
  refreshTokens?: {
    accessToken: string;
    refreshToken: string;
    expiresAt?: number;
  };
}

/**
 * Get access token from cookies, refreshing if needed
 * Returns the token and optionally new tokens if refreshed
 */
export async function getAccessTokenFromCookies(): Promise<TokenResult> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('yahoo_access_token')?.value;
  const refreshToken = cookieStore.get('yahoo_refresh_token')?.value;
  const expiresAt = cookieStore.get('yahoo_token_expires_at')?.value;

  if (!accessToken) {
    return { accessToken: null };
  }

  // Check if token is expired or about to expire (within 5 minutes)
  if (expiresAt && refreshToken) {
    const expiresAtMs = parseInt(expiresAt) * 1000;
    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000;

    if (expiresAtMs < fiveMinutesFromNow) {
      try {
        const newTokens = await refreshAccessToken(refreshToken);
        return {
          accessToken: newTokens.accessToken,
          refreshTokens: newTokens,
        };
      } catch (error) {
        console.error('Failed to refresh token:', error);
        return { accessToken: null };
      }
    }
  }

  return { accessToken };
}

/**
 * Update cookies with new tokens on a NextResponse
 */
export function updateTokenCookies(
  response: NextResponse,
  tokens: { accessToken: string; refreshToken: string; expiresAt?: number }
): void {
  response.cookies.set('yahoo_access_token', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: tokens.expiresAt
      ? Math.floor((tokens.expiresAt * 1000 - Date.now()) / 1000)
      : 3600,
  });

  response.cookies.set('yahoo_refresh_token', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  if (tokens.expiresAt) {
    response.cookies.set('yahoo_token_expires_at', tokens.expiresAt.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    });
  }
}


