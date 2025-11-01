import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/yahoo-auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/?error=missing_code', request.url)
      );
    }

    // Verify state
    const cookieStore = await cookies();
    const storedState = cookieStore.get('yahoo_oauth_state')?.value;
    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        new URL('/?error=invalid_state', request.url)
      );
    }

    // Get code verifier from cookie (required for PKCE)
    const codeVerifier = cookieStore.get('yahoo_oauth_code_verifier')?.value;
    if (!codeVerifier) {
      return NextResponse.redirect(
        new URL('/?error=missing_code_verifier', request.url)
      );
    }

    // Exchange code for tokens using PKCE
    const tokens = await exchangeCodeForTokens(code, codeVerifier);

    // Store tokens in cookies (or you could use session storage)
    const response = NextResponse.redirect(new URL('/dashboard', request.url));

    // Store tokens in httpOnly cookies for security
    response.cookies.set('yahoo_access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expiresAt
        ? Math.floor((tokens.expiresAt * 1000 - Date.now()) / 1000)
        : 3600, // Default to 1 hour
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

    // Clear OAuth state cookies
    response.cookies.delete('yahoo_oauth_state');
    response.cookies.delete('yahoo_oauth_code_verifier');

    return response;
  } catch (error) {
    console.error('OAuth callback error:', error);
    return NextResponse.redirect(
      new URL(
        `/?error=${encodeURIComponent('Failed to complete authentication')}`,
        request.url
      )
    );
  }
}

