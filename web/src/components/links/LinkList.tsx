"use client";

import LinkCard from "@/components/links/LinkCard";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import { LinksResponse } from "@/types/links";

type LinkListProps = {
  limit?: number;
  from?: string;
  to?: string;
  domain?: string;
  tags?: string[];
};

export default function LinkList({
  limit = 50,
  from,
  to,
  domain,
  tags,
}: LinkListProps) {
  const { getToken } = useAuth();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE;

  const apiUrl = (() => {
    if (!apiBaseUrl) return null;
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (domain) params.set("domain", domain);
    if (tags && tags.length > 0) {
      for (const t of tags) params.append("tag", t);
    }
    // Send client timezone so the API can interpret YYYY-MM-DD correctly.
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) params.set("tz", tz);
    } catch {
      // noop
    }
    return `${apiBaseUrl}/api/links?${params.toString()}`;
  })();

  const fetcher = async (url: string) => {
    const token = await getToken();

    if (!token) {
      throw new Error("Unauthorized");
    }

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch links: ${res.status}`);
    }

    return res.json();
  };

  const { data, error, isLoading, mutate } = useSWR<LinksResponse>(
    apiUrl,
    apiUrl ? fetcher : null,
    {
      refreshInterval: 30000, // 30秒ごとに自動更新
      revalidateOnFocus: true,
    },
  );

  if (error) {
    return (
      <div className="text-center py-20 bg-destructive/5 rounded-xl border border-destructive/20">
        <p className="text-destructive font-medium">
          データの取得に失敗しました
        </p>
        <button
          onClick={() => mutate()}
          className="mt-4 px-4 py-2 bg-background border border-input rounded-md text-sm hover:bg-accent transition-colors"
        >
          再試行
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-0 h-[200px] flex flex-col overflow-hidden"
          >
            <div className="flex flex-col md:flex-row h-full">
              <Skeleton className="w-full md:w-[280px] h-48 md:h-full shrink-0" />
              <div className="flex flex-col p-4">
                <div className="space-y-2 mb-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-20 w-full mb-auto" />
                <div className="flex justify-between items-center mt-4">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const links = data?.links || [];

  if (links.length === 0) {
    return (
      <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border">
        <p className="text-muted-foreground mb-4">
          保存されたリンクはありません
        </p>
        <p className="text-sm">
          ブラウザ拡張機能を使ってリンクを保存してください
        </p>
        <button
          onClick={() => mutate()}
          className="mt-6 flex items-center gap-2 mx-auto px-4 py-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          更新
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {links.map((link) => (
        <div key={link.id} className="h-auto">
          <LinkCard link={link} />
        </div>
      ))}
    </div>
  );
}
