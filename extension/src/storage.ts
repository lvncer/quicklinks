export interface QuickLinksConfig {
  apiBaseUrl: string;
  clerkFrontendApiUrl: string;
  clerkToken: string;
  clerkUserId: string;
  clerkTokenExpiresAt: number;
}

const DEFAULT_CONFIG: QuickLinksConfig = {
  apiBaseUrl: "https://quicklinks-production-6429.up.railway.app",
  clerkFrontendApiUrl: "",
  clerkToken: "",
  clerkUserId: "",
  clerkTokenExpiresAt: 0,
};

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

export async function saveConfig(
  config: Partial<QuickLinksConfig>
): Promise<void> {
  await chrome.storage.sync.set(config);
}

export async function clearAuthData(): Promise<void> {
  await chrome.storage.sync.remove([
    "clerkToken",
    "clerkUserId",
    "clerkTokenExpiresAt",
  ]);
}

export async function isClerkConfigured(): Promise<boolean> {
  const config = await getConfig();
  return !!config.clerkToken && !!config.apiBaseUrl;
}
