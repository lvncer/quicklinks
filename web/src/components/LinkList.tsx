"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ja } from "date-fns/locale";
import { ExternalLink, Globe, Calendar, RefreshCw } from "lucide-react";
import Link from "next/link";
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-card p-6 h-[300px] flex flex-col"
          >
            <div className="flex justify-between mb-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-6 w-full mb-2" />
            <Skeleton className="h-32 w-full mb-4 rounded-md" />{" "}
            {/* Image placeholder */}
            <div className="flex justify-between items-center mt-auto">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-8 rounded-full" />
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {links.map((link) => (
        <Card
          key={link.id}
          className="group hover:shadow-md transition-all duration-300 hover:border-primary/50 overflow-hidden flex flex-col h-full bg-card/80 backdrop-blur-sm"
        >
          {/* OGP Image */}
          {link.og_image && (
            <div className="relative w-full h-40 overflow-hidden bg-muted border-b border-border/50">
              <img
                src={link.og_image}
                alt={link.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}

          <CardHeader className="pb-2 pt-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-1">
                <Globe className="w-3 h-3" />
                <span className="truncate max-w-[150px]">{link.domain}</span>
              </div>
            </div>
            <CardTitle className="text-lg leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              <Link
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline decoration-primary/50 underline-offset-4"
              >
                {link.title || "No Title"}
              </Link>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-grow pb-2">
            {/* Description from OGP */}
            {link.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {link.description}
              </p>
            )}

            {/* User Note */}
            {link.note && (
              <div className="bg-secondary/50 p-2.5 rounded-md text-xs text-secondary-foreground/90 italic border border-secondary mt-1">
                "{link.note}"
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-2 pb-4 text-xs text-muted-foreground flex justify-between items-center border-t border-border/50 mt-auto bg-muted/20 px-6 py-3">
            <div className="flex items-center gap-1.5" title={link.saved_at}>
              <Calendar className="w-3 h-3" />
              {formatDistanceToNow(new Date(link.saved_at), {
                addSuffix: true,
                locale: ja,
              })}
            </div>
            <Link
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-primary/10 rounded-full text-primary transition-colors"
              title="開く"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
