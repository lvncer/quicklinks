/**
 * Storage utilities for QuickLinks extension
 */

export interface QuickLinksConfig {
  apiBaseUrl: string;
  sharedSecret: string;
  userIdentifier: string;
}

const DEFAULT_CONFIG: QuickLinksConfig = {
  apiBaseUrl: "http://localhost:8080",
  sharedSecret: "",
  userIdentifier: "",
};

/**
 * Get the current configuration from Chrome storage
 */
export async function getConfig(): Promise<QuickLinksConfig> {
  const result = await chrome.storage.sync.get(DEFAULT_CONFIG);
  return {
    apiBaseUrl: result.apiBaseUrl || DEFAULT_CONFIG.apiBaseUrl,
    sharedSecret: result.sharedSecret || DEFAULT_CONFIG.sharedSecret,
    userIdentifier: result.userIdentifier || DEFAULT_CONFIG.userIdentifier,
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
 * Generate a unique user identifier if not already set
 */
export async function ensureUserIdentifier(): Promise<string> {
  const config = await getConfig();
  if (config.userIdentifier) {
    return config.userIdentifier;
  }

  // Generate a simple unique identifier
  const identifier = `ext_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 9)}`;
  await saveConfig({ userIdentifier: identifier });
  return identifier;
}
