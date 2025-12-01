import { saveLink } from "./api";
import { getConfig, saveConfig } from "./storage";
import { isAuthenticated, getAuthState, parseJwt } from "./auth";

// Context menu ID
const CONTEXT_MENU_ID = "quicklinks-save-link";

// Create context menu on extension install/update
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: "Save link to QuickLinks",
    contexts: ["link"],
  });
});

// Handle context menu click (PC right-click)
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  console.log("[QuickLinks] contextMenus.onClicked", {
    info,
    tabId: tab?.id,
  });

  if (info.menuItemId !== CONTEXT_MENU_ID) return;

  const linkUrl = info.linkUrl;
  if (!linkUrl) {
    console.error("[QuickLinks] No link URL found");
    return;
  }

  try {
    // Check authentication
    if (!(await isAuthenticated())) {
      console.log("[QuickLinks] Context menu clicked but not authenticated");
      if (tab?.id) {
        chrome.tabs.sendMessage(
          tab.id,
          {
            type: "QUICKLINKS_TOAST",
            message: "Please log in first from the extension options",
            toastType: "error",
          },
          () => {
            const err = chrome.runtime.lastError;
            if (err) {
              console.warn(
                "[QuickLinks] Failed to send not-authenticated toast:",
                err.message
              );
            }
          }
        );
      }
      return;
    }

    const pageUrl = tab?.url || info.pageUrl || "";

    // Get link text from selection or use URL
    const linkText = info.selectionText || new URL(linkUrl).hostname;

    await saveLink({
      url: linkUrl,
      title: linkText,
      page: pageUrl,
    });

    // Notify content script to show toast
    if (tab?.id) {
      console.log("[QuickLinks] Sending success toast to tab", tab.id);
      chrome.tabs.sendMessage(
        tab.id,
        {
          type: "QUICKLINKS_TOAST",
          message: "Link saved!",
          toastType: "success",
        },
        () => {
          const err = chrome.runtime.lastError;
          if (err) {
            console.warn(
              "[QuickLinks] Failed to send success toast:",
              err.message
            );
          }
        }
      );
    }
  } catch (error) {
    console.error("[QuickLinks] Error while saving from context menu", error);
    if (tab?.id) {
      chrome.tabs.sendMessage(
        tab.id,
        {
          type: "QUICKLINKS_TOAST",
          message:
            error instanceof Error ? error.message : "Failed to save link",
          toastType: "error",
        },
        () => {
          const err = chrome.runtime.lastError;
          if (err) {
            console.warn(
              "[QuickLinks] Failed to send error toast:",
              err.message
            );
          }
        }
      );
    }
  }
});

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SAVE_LINK") {
    handleSaveLinkMessage(message, sender)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));

    // Return true to indicate async response
    return true;
  }

  if (message.type === "GET_CONFIG") {
    getConfig().then(sendResponse);
    return true;
  }

  if (message.type === "CHECK_AUTH") {
    getAuthState().then(sendResponse);
    return true;
  }

  if (message.type === "QUICKLINKS_SAVE_AUTH") {
    handleSaveAuthMessage(message)
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

async function handleSaveLinkMessage(
  message: { url: string; title: string; page: string; note?: string },
  _sender: chrome.runtime.MessageSender
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    // Check authentication
    if (!(await isAuthenticated())) {
      return {
        success: false,
        error: "Not authenticated. Please log in from the options page.",
      };
    }

    const result = await saveLink({
      url: message.url,
      title: message.title,
      page: message.page,
      note: message.note,
    });

    return { success: true, id: result.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function handleSaveAuthMessage(message: {
  token: string;
  userId?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const token = message.token;

    if (!token) {
      return { success: false, error: "Missing token" };
    }

    const payload = parseJwt(token) as any;

    const userId: string | undefined =
      message.userId || (payload && (payload.sub as string | undefined));

    if (!payload || !userId) {
      return { success: false, error: "Invalid token" };
    }

    const expValue = payload.exp;
    const exp = typeof expValue === "number" ? expValue : undefined;
    const expiresAt = exp ? exp * 1000 : Date.now() + 60 * 60 * 1000;

    await saveConfig({
      clerkToken: token,
      clerkUserId: userId,
      clerkTokenExpiresAt: expiresAt,
    });

    return { success: true };
  } catch (error) {
    console.error("[QuickLinks] Failed to save auth from Web:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
