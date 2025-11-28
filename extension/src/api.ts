/**
 * API client for QuickLinks extension
 */

import { getConfig } from "./storage";

export interface SaveLinkRequest {
  url: string;
  title: string;
  page: string;
  note?: string;
  user_identifier?: string;
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
 * Save a link to the QuickLinks API
 */
export async function saveLink(
  request: SaveLinkRequest
): Promise<SaveLinkResponse> {
  const config = await getConfig();

  if (!config.sharedSecret) {
    throw new Error(
      "Shared secret not configured. Please set up the extension."
    );
  }

  const response = await fetch(`${config.apiBaseUrl}/api/links`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-QuickLink-Secret": config.sharedSecret,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Unknown error" }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}
