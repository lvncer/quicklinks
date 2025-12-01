import { getConfig, clearAuthData } from "./storage";

export interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  token: string | null;
  expiresAt: number | null;
}

/**
 * Get current authentication state
 */
export async function getAuthState(): Promise<AuthState> {
  const config = await getConfig();

  console.log("[QuickLinks] getAuthState - config:", {
    hasToken: !!config.clerkToken,
    hasUserId: !!config.clerkUserId,
    tokenLength: config.clerkToken?.length || 0,
    expiresAt: config.clerkTokenExpiresAt,
    now: Date.now(),
  });

  if (!config.clerkToken || !config.clerkUserId) {
    console.log("[QuickLinks] getAuthState - No token or user ID");
    return {
      isAuthenticated: false,
      userId: null,
      token: null,
      expiresAt: null,
    };
  }

  // Validate token format (should be a JWT with 3 parts)
  const tokenParts = config.clerkToken.split(".");
  if (tokenParts.length !== 3) {
    console.warn(
      "[QuickLinks] getAuthState - Invalid token format, clearing auth"
    );
    await clearAuthData();
    return {
      isAuthenticated: false,
      userId: null,
      token: null,
      expiresAt: null,
    };
  }

  // Check if token is expired
  if (config.clerkTokenExpiresAt && Date.now() > config.clerkTokenExpiresAt) {
    console.log("[QuickLinks] getAuthState - Token expired, clearing auth");
    // Token expired, clear auth data
    await clearAuthData();
    return {
      isAuthenticated: false,
      userId: null,
      token: null,
      expiresAt: null,
    };
  }

  // Verify token payload is valid
  const tokenPayload = parseJwt(config.clerkToken);
  const userId = tokenPayload?.sub as string | undefined;
  if (!tokenPayload || !userId) {
    console.warn(
      "[QuickLinks] getAuthState - Invalid token payload, clearing auth"
    );
    await clearAuthData();
    return {
      isAuthenticated: false,
      userId: null,
      token: null,
      expiresAt: null,
    };
  }

  console.log("[QuickLinks] getAuthState - Authenticated:", {
    userId: config.clerkUserId,
    tokenSub: userId,
    matches: config.clerkUserId === userId,
  });

  return {
    isAuthenticated: true,
    userId: config.clerkUserId,
    token: config.clerkToken,
    expiresAt: config.clerkTokenExpiresAt || null,
  };
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const state = await getAuthState();
  return state.isAuthenticated;
}

/**
 * Get the current auth token
 */
export async function getToken(): Promise<string | null> {
  const state = await getAuthState();
  return state.token;
}

/**
 * Parse a JWT token without validation (for client-side use only)
 */
export function parseJwt(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// Note: token refresh / login flows are handled by the Web app.
