window.addEventListener("message", (event: MessageEvent) => {
  if (event.source !== window) {
    return;
  }

  const data = event.data;

  if (!data || typeof data !== "object") {
    return;
  }

  if (data.type !== "QUICKLINKS_EXTENSION_AUTH") {
    return;
  }

  if (event.origin !== window.location.origin) {
    console.warn(
      "[QuickLinks] Ignoring auth message from unexpected origin:",
      event.origin
    );
    return;
  }

  const token = data.token;
  const userId = data.userId as string | undefined;
  const apiBaseUrl = data.apiBaseUrl as string | undefined;

  if (typeof token !== "string" || !token) {
    console.warn("[QuickLinks] Received auth message without valid token");
    return;
  }

  try {
    chrome.runtime.sendMessage(
      {
        type: "QUICKLINKS_SAVE_AUTH",
        token,
        userId,
        apiBaseUrl,
      },
      () => {
        const err = chrome.runtime.lastError;
        if (err) {
          console.warn(
            "[QuickLinks] Failed to send auth to background:",
            err.message
          );
        }
      }
    );
  } catch (error) {
    console.warn(
      "[QuickLinks] Failed to send auth to background (exception):",
      error
    );
  }
});
