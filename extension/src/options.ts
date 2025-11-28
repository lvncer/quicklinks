/**
 * Options page script for QuickLinks extension
 */

import { getConfig, saveConfig, ensureUserIdentifier } from "./storage";

const apiBaseUrlInput = document.getElementById(
  "apiBaseUrl"
) as HTMLInputElement;
const sharedSecretInput = document.getElementById(
  "sharedSecret"
) as HTMLInputElement;
const userIdentifierInput = document.getElementById(
  "userIdentifier"
) as HTMLInputElement;
const saveBtn = document.getElementById("saveBtn") as HTMLButtonElement;
const testBtn = document.getElementById("testBtn") as HTMLButtonElement;
const statusDiv = document.getElementById("status") as HTMLDivElement;

/**
 * Load current configuration
 */
async function loadConfig(): Promise<void> {
  const config = await getConfig();
  apiBaseUrlInput.value = config.apiBaseUrl;
  sharedSecretInput.value = config.sharedSecret;

  const userIdentifier = await ensureUserIdentifier();
  userIdentifierInput.value = userIdentifier;
}

/**
 * Save configuration
 */
async function handleSave(): Promise<void> {
  try {
    await saveConfig({
      apiBaseUrl: apiBaseUrlInput.value.trim() || "http://localhost:8080",
      sharedSecret: sharedSecretInput.value.trim(),
    });

    showStatus("Settings saved successfully! ✨", "success");
  } catch (error) {
    showStatus(`Failed to save: ${error}`, "error");
  }
}

/**
 * Test API connection
 */
async function handleTest(): Promise<void> {
  const apiBaseUrl = apiBaseUrlInput.value.trim() || "http://localhost:8080";
  const sharedSecret = sharedSecretInput.value.trim();

  if (!sharedSecret) {
    showStatus("Please enter a shared secret first", "error");
    return;
  }

  testBtn.disabled = true;
  testBtn.textContent = "⏳ Testing...";

  try {
    // Try to send a test request (will fail to insert but validates auth)
    const response = await fetch(`${apiBaseUrl}/api/links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-QuickLink-Secret": sharedSecret,
      },
      body: JSON.stringify({
        url: "https://test.example.com",
        title: "Connection Test",
        page: "chrome-extension://options",
      }),
    });

    if (response.ok) {
      showStatus("Connection successful! API is working 🎉", "success");
    } else if (response.status === 401) {
      showStatus("Authentication failed - check your shared secret", "error");
    } else {
      const data = await response.json().catch(() => ({}));
      showStatus(`API error: ${data.error || response.statusText}`, "error");
    }
  } catch (error) {
    showStatus(
      `Connection failed: ${
        error instanceof Error ? error.message : "Network error"
      }`,
      "error"
    );
  } finally {
    testBtn.disabled = false;
    testBtn.textContent = "🔍 Test";
  }
}

/**
 * Show status message
 */
function showStatus(message: string, type: "success" | "error"): void {
  statusDiv.textContent = message;
  statusDiv.className = `status ${type}`;

  // Auto-hide after 5 seconds
  setTimeout(() => {
    statusDiv.className = "status";
  }, 5000);
}

// Event listeners
saveBtn.addEventListener("click", handleSave);
testBtn.addEventListener("click", handleTest);

// Load config on page load
loadConfig();
