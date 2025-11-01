import {
  discovery,
  buildAuthorizationUrl,
  authorizationCodeGrant,
  refreshTokenGrant,
  randomPKCECodeVerifier,
  calculatePKCECodeChallenge,
} from "openid-client";

const YAHOO_DISCOVERY_URL =
  "https://api.login.yahoo.com/.well-known/openid-configuration";

let yahooConfig: Awaited<ReturnType<typeof discovery>> | null = null;

/**
 * Get Yahoo OAuth configuration (discovered automatically)
 * Uses PKCE flow - no client secret required
 */
export async function getYahooConfig() {
  if (!yahooConfig) {
    const clientId = process.env.YAHOO_CLIENT_ID;

    if (!clientId) {
      throw new Error("Yahoo OAuth client ID not configured");
    }

    yahooConfig = await discovery(new URL(YAHOO_DISCOVERY_URL), clientId);
  }
  return yahooConfig;
}

/**
 * Generate PKCE code verifier and challenge
 */
export async function generatePKCE() {
  const codeVerifier = randomPKCECodeVerifier();
  const codeChallenge = await calculatePKCECodeChallenge(codeVerifier);
  return { codeVerifier, codeChallenge };
}

/**
 * Generate authorization URL with PKCE
 */
export async function getAuthorizationUrl(
  state: string,
  codeChallenge: string
) {
  const config = await getYahooConfig();
  const redirectUri = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/api/auth/yahoo/callback`;

  const url = buildAuthorizationUrl(config, {
    redirect_uri: redirectUri,
    scope: "openid profile email fspt-r", // fspt-r is required for Fantasy Sports API read access
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256", // SHA256
  });

  return url.toString();
}

/**
 * Exchange authorization code for tokens using PKCE
 */
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string
) {
  const config = await getYahooConfig();
  const redirectUri = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/api/auth/yahoo/callback`;

  const callbackUrl = new URL(redirectUri);
  callbackUrl.searchParams.set("code", code);

  const tokenSet = await authorizationCodeGrant(
    config,
    callbackUrl,
    undefined,
    { code_verifier: codeVerifier }
  );

  if (!tokenSet.access_token || !tokenSet.refresh_token) {
    throw new Error("Failed to obtain tokens from Yahoo");
  }

  return {
    accessToken: tokenSet.access_token,
    refreshToken: tokenSet.refresh_token,
    expiresAt:
      typeof tokenSet.expires_at === "number" ? tokenSet.expires_at : undefined,
  };
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken: string) {
  const config = await getYahooConfig();

  const tokenSet = await refreshTokenGrant(config, refreshToken);

  if (!tokenSet.access_token) {
    throw new Error("Failed to refresh access token");
  }

  return {
    accessToken: tokenSet.access_token,
    refreshToken: tokenSet.refresh_token || refreshToken,
    expiresAt:
      typeof tokenSet.expires_at === "number" ? tokenSet.expires_at : undefined,
  };
}
