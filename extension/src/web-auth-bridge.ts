// Content script 専用: QuickLinks Web ↔ 拡張の認証同期ブリッジ
// QuickLinks Web からの window.postMessage を受け取り、拡張の background に転送する。

// メッセージイベントのハンドラ
window.addEventListener("message", (event: MessageEvent) => {
  // 同一ウィンドウからのメッセージのみ対象
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

  // origin チェック: QuickLinks Web 上でのみ動く前提なので、
  // 実際の origin が window.location.origin と一致しているかを確認する。
  if (event.origin !== window.location.origin) {
    console.warn(
      "[QuickLinks] Ignoring auth message from unexpected origin:",
      event.origin
    );
    return;
  }

  const token = data.token;
  const userId = data.userId as string | undefined;

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
