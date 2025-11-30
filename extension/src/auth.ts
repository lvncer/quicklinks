import { getConfig, saveConfig, clearAuthData } from "./storage";

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
 * Start the Clerk OAuth login flow using chrome.identity.launchWebAuthFlow
 *
 * This opens the Web app's sign-in page, and after authentication,
 * the user is redirected back with a JWT token that we can extract.
 *
 * Note: This requires the Web app to be configured to redirect back to the extension
 * with the JWT token in the URL.
 */
export async function login(): Promise<AuthState> {
  const config = await getConfig();

  if (!config.clerkFrontendApiUrl) {
    throw new Error(
      "Clerk Frontend API URL not configured. Please set it in the options page."
    );
  }

  // Get the redirect URL for the extension
  const redirectUrl = chrome.identity.getRedirectURL();

  // Use Clerk's sign-in page with redirect
  // The Web app should be configured to redirect back to this URL with the JWT
  // Format: https://[frontend-api]/v1/client/sign_in?redirect_url=[redirect-url]
  const authUrl = `${
    config.clerkFrontendApiUrl
  }/v1/client/sign_in?redirect_url=${encodeURIComponent(redirectUrl)}`;

  try {
    // Launch the auth flow
    const responseUrl = await chrome.identity.launchWebAuthFlow({
      url: authUrl,
      interactive: true,
    });

    if (!responseUrl) {
      throw new Error("Authentication was cancelled");
    }

    // Parse the response URL to extract the token
    const url = new URL(responseUrl);

    // Try to extract JWT from various possible locations in the URL
    let jwtToken =
      url.searchParams.get("__token") ||
      url.searchParams.get("token") ||
      url.searchParams.get("jwt") ||
      url.hash.match(/[#&]token=([^&]+)/)?.[1] ||
      url.hash.match(/[#&]jwt=([^&]+)/)?.[1];

    // If no token in URL, the Web app might need to pass it differently
    // For now, we'll try to get it from the session
    if (!jwtToken) {
      // Try to get session token and exchange it
      const sessionTokenParam = url.searchParams.get("__session");
      const sessionTokenHash = url.hash.match(/[#&]__session=([^&]+)/)?.[1];
      // Get session token (may be null or undefined)
      // Convert null to undefined for type compatibility
      const sessionTokenRaw = sessionTokenParam ?? sessionTokenHash;
      const sessionToken: string | undefined =
        sessionTokenRaw === null
          ? undefined
          : (sessionTokenRaw as string | undefined);

      if (sessionToken) {
        // @ts-expect-error - sessionToken is string | undefined but TypeScript infers string | null
        jwtToken = await exchangeSessionTokenForJWT(
          sessionToken,
          config.clerkFrontendApiUrl
        );
      }
    }

    if (!jwtToken) {
      throw new Error(
        "No authentication token received. " +
          "Please ensure the Web app is configured to redirect with a token parameter."
      );
    }

    // Decode the JWT to get user info
    const tokenPayload = parseJwt(jwtToken);
    const userId = tokenPayload?.sub as string | undefined;

    if (!tokenPayload || !userId) {
      throw new Error(
        "Invalid JWT token received. Token does not contain user ID."
      );
    }

    // Calculate expiration (default to 1 hour if not specified)
    const exp = tokenPayload.exp as number | undefined;
    const expiresAt = exp ? exp * 1000 : Date.now() + 60 * 60 * 1000;

    // Save the auth data
    await saveConfig({
      clerkToken: jwtToken,
      clerkUserId: userId,
      clerkTokenExpiresAt: expiresAt,
    });

    // Verify the token was saved correctly
    const savedConfig = await getConfig();
    if (!savedConfig.clerkToken || savedConfig.clerkToken !== jwtToken) {
      throw new Error("Failed to save authentication token. Please try again.");
    }

    return {
      isAuthenticated: true,
      userId: userId,
      token: jwtToken,
      expiresAt,
    };
  } catch (error) {
    console.error("Login failed:", error);
    // Clear any partial auth data on error
    await clearAuthData();
    throw error;
  }
}

/**
 * Exchange Clerk session token for JWT token
 * This calls Clerk's API to get a JWT from the session token
 */
async function exchangeSessionTokenForJWT(
  sessionToken: string | undefined,
  frontendApiUrl: string
): Promise<string | null> {
  if (!sessionToken) {
    return null;
  }
  try {
    // Note: This endpoint might not be publicly accessible
    // In a real implementation, you might need to call your own backend API
    // that exchanges the session token for a JWT using Clerk's Backend API
    const response = await fetch(
      `${frontendApiUrl}/v1/client/sessions/${sessionToken}/tokens`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.warn(
        "Failed to exchange session token via API, trying direct use"
      );
      // If API call fails, the session token might already be a JWT
      // Try parsing it
      const payload = parseJwt(sessionToken);
      const userId = payload?.sub as string | undefined;
      if (payload && userId) {
        return sessionToken;
      }
      return null;
    }

    const data = await response.json();
    return data.jwt || data.token || null;
  } catch (error) {
    console.error("Error exchanging session token:", error);
    // If API call fails, try using the session token directly as JWT
    const payload = parseJwt(sessionToken);
    const userId = payload?.sub as string | undefined;
    if (payload && userId) {
      return sessionToken;
    }
    return null;
  }
}

/**
 * Logout - clear auth data
 */
export async function logout(): Promise<void> {
  await clearAuthData();
}

/**
 * Parse a JWT token without validation (for client-side use only)
 */
function parseJwt(token: string): Record<string, unknown> | null {
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

/**
 * Refresh token if needed (for future implementation)
 */
export async function refreshTokenIfNeeded(): Promise<boolean> {
  const config = await getConfig();

  if (!config.clerkToken || !config.clerkTokenExpiresAt) {
    return false;
  }

  // Check if token expires within 5 minutes
  const fiveMinutes = 5 * 60 * 1000;
  if (Date.now() + fiveMinutes < config.clerkTokenExpiresAt) {
    // Token is still valid
    return true;
  }

  // Token is about to expire or already expired
  // For now, we just return false and let the user re-login
  // In a production app, you might implement token refresh here
  return false;
}
