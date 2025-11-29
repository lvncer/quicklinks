"use client";

import LinkCard from "@/components/LinkCard";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";
import useSWR from "swr";

interface LinkItem {
  id: string;
  url: string;
  title: string;
  description: string;
  domain: string;
  og_image: string;
  page_url: string;
  note: string;
  user_identifier: string;
  saved_at: string;
}

interface LinksResponse {
  links: LinkItem[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LinkList() {
  const { data, error, isLoading, mutate } = useSWR<LinksResponse>(
    "/api/links",
    fetcher,
    {
      refreshInterval: 30000, // 30秒ごとに自動更新
      revalidateOnFocus: true,
    }
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
