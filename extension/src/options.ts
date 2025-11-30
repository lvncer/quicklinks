import { getConfig, saveConfig } from "./storage";
import { getAuthState, login, logout } from "./auth";

// DOM Elements
const apiBaseUrlInput = document.getElementById(
  "apiBaseUrl"
) as HTMLInputElement;
const clerkFrontendApiUrlInput = document.getElementById(
  "clerkFrontendApiUrl"
) as HTMLInputElement;
const saveBtn = document.getElementById("saveBtn") as HTMLButtonElement;
const loginBtn = document.getElementById("loginBtn") as HTMLButtonElement;
const logoutBtn = document.getElementById("logoutBtn") as HTMLButtonElement;
const statusDiv = document.getElementById("status") as HTMLDivElement;
const authStatusMessage = document.getElementById(
  "authStatusMessage"
) as HTMLDivElement;

// Auth status elements
const authIcon = document.getElementById("authIcon") as HTMLDivElement;
const authTitle = document.getElementById("authTitle") as HTMLElement;
const authSubtitle = document.getElementById("authSubtitle") as HTMLElement;
const loggedOutSection = document.getElementById(
  "loggedOutSection"
) as HTMLDivElement;
const loggedInSection = document.getElementById(
  "loggedInSection"
) as HTMLDivElement;

/**
 * Load current configuration and auth state
 */
async function loadConfig(): Promise<void> {
  const config = await getConfig();
  apiBaseUrlInput.value = config.apiBaseUrl;
  clerkFrontendApiUrlInput.value = config.clerkFrontendApiUrl;

  await updateAuthUI();
}

/**
 * Update authentication UI based on current state
 */
async function updateAuthUI(): Promise<void> {
  const authState = await getAuthState();

  if (authState.isAuthenticated) {
    // Logged in
    authIcon.textContent = "✅";
    authIcon.className = "auth-status-icon logged-in";
    authTitle.textContent = "ログイン済み";
    authSubtitle.textContent = `User ID: ${authState.userId?.slice(0, 16)}...`;
    loggedOutSection.classList.add("hidden");
    loggedInSection.classList.remove("hidden");
  } else {
    // Logged out
    authIcon.textContent = "❌";
    authIcon.className = "auth-status-icon logged-out";
    authTitle.textContent = "ログインしていません";
    authSubtitle.textContent = "ログインしてリンクを保存しましょう";
    loggedOutSection.classList.remove("hidden");
    loggedInSection.classList.add("hidden");
  }
}

/**
 * Save API configuration
 */
async function handleSave(): Promise<void> {
  try {
    await saveConfig({
      apiBaseUrl: apiBaseUrlInput.value.trim() || "http://localhost:8080",
      clerkFrontendApiUrl: clerkFrontendApiUrlInput.value.trim(),
    });

    showStatus("Settings saved successfully! ✨", "success");
  } catch (error) {
    showStatus(`Failed to save: ${error}`, "error");
  }
}

/**
 * Handle login
 */
async function handleLogin(): Promise<void> {
  const clerkUrl = clerkFrontendApiUrlInput.value.trim();

  if (!clerkUrl) {
    showAuthStatus("Please enter Clerk Frontend API URL first", "error");
    return;
  }

  // Save the Clerk URL first
  await saveConfig({ clerkFrontendApiUrl: clerkUrl });

  loginBtn.disabled = true;
  loginBtn.textContent = "⏳ ログイン中...";

  try {
    const authState = await login();
    console.log("[QuickLinks] Login result:", authState);
    
    // Verify the auth state was saved correctly
    const verifyState = await getAuthState();
    console.log("[QuickLinks] Verified auth state:", verifyState);
    
    if (!verifyState.isAuthenticated || !verifyState.token) {
      throw new Error("Login succeeded but token was not saved correctly. Please try again.");
    }
    
    showAuthStatus("Login successful! 🎉", "success");
    
    // Force UI update with a small delay to ensure storage is synced
    setTimeout(async () => {
      await updateAuthUI();
    }, 100);
  } catch (error) {
    console.error("[QuickLinks] Login error:", error);
    showAuthStatus(
      `Login failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      "error"
    );
    // Update UI to show logged out state
    await updateAuthUI();
  } finally {
    loginBtn.disabled = false;
    loginBtn.textContent = "🔑 ログイン";
  }
}

/**
 * Handle logout
 */
async function handleLogout(): Promise<void> {
  logoutBtn.disabled = true;
  logoutBtn.textContent = "⏳ ログアウト中...";

  try {
    await logout();
    showAuthStatus("Logged out successfully", "success");
    await updateAuthUI();
  } catch (error) {
    showAuthStatus(
      `Logout failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      "error"
    );
  } finally {
    logoutBtn.disabled = false;
    logoutBtn.textContent = "🚪 ログアウト";
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

/**
 * Show auth status message
 */
function showAuthStatus(message: string, type: "success" | "error"): void {
  authStatusMessage.textContent = message;
  authStatusMessage.className = `status ${type}`;

  // Auto-hide after 5 seconds
  setTimeout(() => {
    authStatusMessage.className = "status";
  }, 5000);
}

// Event listeners
saveBtn.addEventListener("click", handleSave);
loginBtn.addEventListener("click", handleLogin);
logoutBtn.addEventListener("click", handleLogout);

// Load config on page load
loadConfig();
