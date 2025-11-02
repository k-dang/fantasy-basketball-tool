import { NextResponse } from 'next/server';
import { getAuthorizationUrl, generatePKCE } from '@/lib/yahoo-auth';
import { randomBytes } from 'crypto';

export async function GET() {
  try {
    // Generate state for security
    const state = randomBytes(16).toString('hex');

    // Generate PKCE code verifier and challenge
    const { codeVerifier, codeChallenge } = await generatePKCE();

    // Get authorization URL with PKCE
    const authUrl = await getAuthorizationUrl(state, codeChallenge);

    const response = NextResponse.redirect(authUrl);

    // Store state and code verifier in cookies for validation in callback
    response.cookies.set('yahoo_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });

    // Store code verifier for PKCE (required when exchanging code for tokens)
    response.cookies.set('yahoo_oauth_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
    });

    return response;
  } catch (error) {
    console.error('OAuth initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }
}

