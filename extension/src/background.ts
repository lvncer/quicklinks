/**
 * Background Service Worker for QuickLinks extension
 * Handles context menu (PC right-click) and API communication
 */

import { saveLink } from "./api";
import { getConfig, ensureUserIdentifier } from "./storage";

// Context menu ID
const CONTEXT_MENU_ID = "quicklinks-save-link";

// Create context menu on extension install/update
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: CONTEXT_MENU_ID,
    title: "Save link to QuickLinks",
    contexts: ["link"],
  });

  console.log("[QuickLinks] Context menu created");
});

// Handle context menu click (PC right-click)
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== CONTEXT_MENU_ID) return;

  const linkUrl = info.linkUrl;
  if (!linkUrl) {
    console.error("[QuickLinks] No link URL found");
    return;
  }

  try {
    const userIdentifier = await ensureUserIdentifier();
    const pageUrl = tab?.url || info.pageUrl || "";

    // Get link text from selection or use URL
    const linkText = info.selectionText || new URL(linkUrl).hostname;

    await saveLink({
      url: linkUrl,
      title: linkText,
      page: pageUrl,
      user_identifier: userIdentifier,
    });

    // Notify content script to show toast
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: "QUICKLINKS_TOAST",
        message: "Link saved!",
        toastType: "success",
      });
    }

    console.log("[QuickLinks] Link saved via context menu:", linkUrl);
  } catch (error) {
    console.error("[QuickLinks] Failed to save link:", error);

    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: "QUICKLINKS_TOAST",
        message: error instanceof Error ? error.message : "Failed to save link",
        toastType: "error",
      });
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
});

async function handleSaveLinkMessage(
  message: { url: string; title: string; page: string; note?: string },
  _sender: chrome.runtime.MessageSender
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const userIdentifier = await ensureUserIdentifier();

    const result = await saveLink({
      url: message.url,
      title: message.title,
      page: message.page,
      note: message.note,
      user_identifier: userIdentifier,
    });

    return { success: true, id: result.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

console.log("[QuickLinks] Background service worker loaded");
