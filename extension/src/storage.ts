export interface QuickLinksConfig {
  apiBaseUrl: string;
  // Clerk authentication
  clerkFrontendApiUrl: string;
  clerkToken: string;
  clerkUserId: string;
  clerkTokenExpiresAt: number;
}

const DEFAULT_CONFIG: QuickLinksConfig = {
  apiBaseUrl: "http://localhost:8080",
  clerkFrontendApiUrl: "",
  clerkToken: "",
  clerkUserId: "",
  clerkTokenExpiresAt: 0,
};

/**
 * Get the current configuration from Chrome storage
 */
export async function getConfig(): Promise<QuickLinksConfig> {
  const result = await chrome.storage.sync.get(DEFAULT_CONFIG);
  return {
    apiBaseUrl: result.apiBaseUrl || DEFAULT_CONFIG.apiBaseUrl,
    clerkFrontendApiUrl:
      result.clerkFrontendApiUrl || DEFAULT_CONFIG.clerkFrontendApiUrl,
    clerkToken: result.clerkToken || DEFAULT_CONFIG.clerkToken,
    clerkUserId: result.clerkUserId || DEFAULT_CONFIG.clerkUserId,
    clerkTokenExpiresAt:
      result.clerkTokenExpiresAt || DEFAULT_CONFIG.clerkTokenExpiresAt,
  };
}

/**
 * Save configuration to Chrome storage
 */
export async function saveConfig(
  config: Partial<QuickLinksConfig>
): Promise<void> {
  await chrome.storage.sync.set(config);
}

/**
 * Clear authentication data (logout)
 */
export async function clearAuthData(): Promise<void> {
  await chrome.storage.sync.remove([
    "clerkToken",
    "clerkUserId",
    "clerkTokenExpiresAt",
  ]);
}

/**
 * Check if Clerk is configured
 */
export async function isClerkConfigured(): Promise<boolean> {
  const config = await getConfig();
  return !!config.clerkFrontendApiUrl;
}
