import { getConfig } from "./storage";
import { getToken, isAuthenticated } from "./auth";

export interface SaveLinkRequest {
  url: string;
  title: string;
  page: string;
  note?: string;
  tags?: string[];
}

export interface SaveLinkResponse {
  id: string;
}

export interface ApiError {
  error: string;
  detail?: string;
}

/**
 * Get authorization headers for API requests
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getToken();

  if (!token) {
    throw new Error("Not authenticated. Please log in first.");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

/**
 * Save a link to the QuickLinks API
 */
export async function saveLink(
  request: SaveLinkRequest
): Promise<SaveLinkResponse> {
  const config = await getConfig();

  // Check if authenticated
  if (!(await isAuthenticated())) {
    throw new Error("Not authenticated. Please log in from the options page.");
  }

  const headers = await getAuthHeaders();

  const response = await fetch(`${config.apiBaseUrl}/api/links`, {
    method: "POST",
    headers,
    body: JSON.stringify(request),
  });

  if (response.status === 401) {
    throw new Error("Session expired. Please log in again from the options page.");
  }

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}
