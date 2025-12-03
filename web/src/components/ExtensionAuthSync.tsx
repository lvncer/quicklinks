"use client";

import { useEffect } from "react";
import { useAuth } from "@clerk/nextjs";

// Web ↔ 拡張の認証同期コンポーネント
// ユーザーが Web にログインしている場合、Clerk の JWT を拡張へ postMessage する
export function ExtensionAuthSync() {
  const { isSignedIn, getToken, userId } = useAuth();

  useEffect(() => {
    if (!isSignedIn || typeof window === "undefined") {
      return;
    }

    let cancelled = false;

    const sync = async () => {
      try {
        const token = await getToken({ template: "quicklinks-extension" });
        if (!token || !userId || cancelled) {
          return;
        }

        const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE;

        const message = {
          source: "quicklinks-web",
          type: "QUICKLINKS_EXTENSION_AUTH" as const,
          token,
          userId,
          apiBaseUrl,
        };

        const targetOrigin =
          process.env.NEXT_PUBLIC_WEB_ORIGIN || window.location.origin;

        window.postMessage(message, targetOrigin);
      } catch (error) {
        console.error("[QuickLinks] Failed to sync auth to extension:", error);
      }
    };

    // 初回同期
    sync();

    // 定期的に再同期（例: 5分ごと）
    const intervalId = window.setInterval(sync, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [isSignedIn, getToken, userId]);

  return null;
}
