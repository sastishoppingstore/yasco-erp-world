/**
 * Qiwa OAuth2 Authentication Service
 * 
 * Handles OAuth2 authentication with Qiwa API for visa and labor management.
 * Manages tokens, refresh cycles, and secure credential storage.
 */

import { z } from "zod";

export interface QiwaOAuth2Config {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  tokenEndpoint: string;
  authorizationEndpoint: string;
  revokeEndpoint: string;
  scope: string[];
}

export interface QiwaAccessTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

export interface QiwaAuthState {
  accessToken: string;
  refreshToken?: string;
  tokenType: string;
  expiresAt: Date;
  scope: string;
  issuedAt: Date;
}

/**
 * Generate authorization URL for OAuth2 flow
 */
export function generateAuthorizationUrl(
  config: QiwaOAuth2Config,
  state: string,
  codeChallenge?: string
): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: config.scope.join(" "),
    state,
  });

  if (codeChallenge) {
    params.append("code_challenge", codeChallenge);
    params.append("code_challenge_method", "S256");
  }

  return `${config.authorizationEndpoint}?${params.toString()}`;
}

/**
 * Exchange authorization code for access token
 */
export async function exchangeAuthorizationCode(
  config: QiwaOAuth2Config,
  code: string,
  codeVerifier?: string
): Promise<{
  success: boolean;
  token?: QiwaAccessTokenResponse;
  error?: string;
}> {
  try {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
    });

    if (codeVerifier) {
      body.append("code_verifier", codeVerifier);
    }

    const response = await fetch(config.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error_description || error.error || "Token exchange failed",
      };
    }

    const token: QiwaAccessTokenResponse = await response.json();
    return {
      success: true,
      token,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Token exchange failed",
    };
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(
  config: QiwaOAuth2Config,
  refreshToken: string
): Promise<{
  success: boolean;
  token?: QiwaAccessTokenResponse;
  error?: string;
}> {
  try {
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    });

    const response = await fetch(config.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      return {
        success: false,
        error: error.error_description || error.error || "Token refresh failed",
      };
    }

    const token: QiwaAccessTokenResponse = await response.json();
    return {
      success: true,
      token,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Token refresh failed",
    };
  }
}

/**
 * Revoke access token
 */
export async function revokeAccessToken(
  config: QiwaOAuth2Config,
  token: string
): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const body = new URLSearchParams({
      token,
      client_id: config.clientId,
      client_secret: config.clientSecret,
    });

    const response = await fetch(config.revokeEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    return {
      success: response.ok,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Token revocation failed",
    };
  }
}

/**
 * Check if token is expired or near expiration
 */
export function isTokenExpired(authState: QiwaAuthState, bufferSeconds: number = 300): boolean {
  const now = new Date();
  const expirationTime = new Date(authState.expiresAt.getTime() - bufferSeconds * 1000);
  return now >= expirationTime;
}

/**
 * Calculate seconds until token expiration
 */
export function getSecondsUntilExpiration(authState: QiwaAuthState): number {
  const now = new Date();
  const expiresIn = authState.expiresAt.getTime() - now.getTime();
  return Math.floor(expiresIn / 1000);
}

/**
 * Create auth state from token response
 */
export function createAuthState(
  tokenResponse: QiwaAccessTokenResponse,
  issuedAt?: Date
): QiwaAuthState {
  const now = issuedAt || new Date();
  return {
    accessToken: tokenResponse.access_token,
    refreshToken: tokenResponse.refresh_token,
    tokenType: tokenResponse.token_type,
    expiresAt: new Date(now.getTime() + tokenResponse.expires_in * 1000),
    scope: tokenResponse.scope,
    issuedAt: now,
  };
}

/**
 * Generate PKCE code challenge
 */
export async function generatePKCEChallenge(): Promise<{
  codeVerifier: string;
  codeChallenge: string;
}> {
  const codeVerifier = generateRandomString(128);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  return {
    codeVerifier,
    codeChallenge,
  };
}

/**
 * Generate random string for PKCE
 */
function generateRandomString(length: number): string {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";
  let result = "";
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);

  randomValues.forEach((x) => {
    result += charset[x % charset.length];
  });

  return result;
}

/**
 * Generate code challenge from code verifier
 */
async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const buffer = new TextEncoder().encode(codeVerifier);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashString = hashArray.map((b) => String.fromCharCode(b)).join("");
  return btoa(hashString).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * OAuth2 State validation
 */
export function generateOAuth2State(): string {
  const randomString = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return btoa(JSON.stringify({
    timestamp: Date.now(),
    random: randomString,
  }));
}

/**
 * Validate OAuth2 state
 */
export function validateOAuth2State(state: string, maxAgeSeconds: number = 600): boolean {
  try {
    const decoded = JSON.parse(atob(state));
    const age = (Date.now() - decoded.timestamp) / 1000;
    return age <= maxAgeSeconds;
  } catch {
    return false;
  }
}

/**
 * Schema for Qiwa OAuth2 configuration
 */
export const QiwaOAuth2ConfigSchema = z.object({
  clientId: z.string().min(1),
  clientSecret: z.string().min(1),
  redirectUri: z.string().url(),
  tokenEndpoint: z.string().url(),
  authorizationEndpoint: z.string().url(),
  revokeEndpoint: z.string().url(),
  scope: z.array(z.string()),
});

/**
 * Schema for auth state
 */
export const QiwaAuthStateSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  tokenType: z.string(),
  expiresAt: z.date(),
  scope: z.string(),
  issuedAt: z.date(),
});

/**
 * Default Qiwa OAuth2 scopes
 */
export const QIWA_DEFAULT_SCOPES = [
  "visa:read",
  "visa:write",
  "labor:read",
  "labor:write",
  "quota:read",
  "quota:write",
  "sponsorship:read",
  "sponsorship:write",
];

/**
 * Qiwa API endpoints
 */
export const QIWA_API_ENDPOINTS = {
  visa: "/api/v1/visa",
  laborPermit: "/api/v1/labor-permit",
  quota: "/api/v1/quota",
  sponsorship: "/api/v1/sponsorship",
  workers: "/api/v1/workers",
};
