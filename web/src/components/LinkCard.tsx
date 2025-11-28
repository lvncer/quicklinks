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
import { ExternalLink, Globe, Calendar, ImageIcon } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";

interface LinkItem {
  id: string;
  url: string;
  title: string;
  description: string; // DBからの値（あれば）
  domain: string;
  og_image: string; // DBからの値（あれば）
  page_url: string;
  note: string;
  user_identifier: string;
  saved_at: string;
}

interface OgData {
  title: string;
  description: string;
  image: string;
}

const ogFetcher = (url: string) => fetch(url).then((res) => res.json());

export default function LinkCard({ link }: { link: LinkItem }) {
  // リアルタイムでOGPを取得
  const { data: ogData, isLoading } = useSWR<OgData>(
    `/api/og?url=${encodeURIComponent(link.url)}`,
    ogFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1分間は再取得しない
    }
  );

  // DBの値または取得したOGPデータを使用
  const displayImage = ogData?.image || link.og_image;
  const displayDesc = ogData?.description || link.description;
  const displayTitle = ogData?.title || link.title || "No Title";

  return (
    <Card className="group hover:shadow-md transition-all duration-300 hover:border-primary/50 overflow-hidden flex flex-col h-full bg-card/80 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row h-full">
        {/* 左側: OGP Image (16:9) */}
        <div className="relative w-full md:w-[280px] shrink-0 bg-muted border-b md:border-b-0 md:border-r border-border/50">
          <div className="aspect-video w-full h-full relative">
            {isLoading ? (
              <Skeleton className="w-full h-full absolute inset-0" />
            ) : displayImage ? (
              <img
                src={displayImage}
                alt={displayTitle}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 absolute inset-0"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                  (
                    e.target as HTMLImageElement
                  ).nextElementSibling?.classList.remove("hidden");
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 bg-muted/50 absolute inset-0">
                <ImageIcon className="w-10 h-10" />
              </div>
            )}
            {/* Fallback icon (hidden by default) */}
            <div className="hidden w-full h-full absolute inset-0 items-center justify-center text-muted-foreground/30 bg-muted/50">
              <ImageIcon className="w-10 h-10" />
            </div>
          </div>
        </div>

        {/* 右側: コンテンツ */}
        <div className="flex flex-col flex-grow min-w-0">
          <CardHeader className="pb-2 pt-4 px-4 md:px-5">
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
                {displayTitle}
              </Link>
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-grow pb-2 px-4 md:px-5">
            {/* Description */}
            {isLoading ? (
              <div className="space-y-2 mb-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ) : (
              displayDesc && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {displayDesc}
                </p>
              )
            )}

            {/* User Note */}
            {link.note && (
              <div className="bg-secondary/50 p-2.5 rounded-md text-xs text-secondary-foreground/90 italic border border-secondary mt-1">
                "{link.note}"
              </div>
            )}
          </CardContent>

          <CardFooter className="pt-2 pb-4 px-4 md:px-5 text-xs text-muted-foreground flex justify-between items-center border-t border-border/50 mt-auto bg-muted/20 py-3">
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
              className="hover:bg-primary/10 rounded-full text-primary transition-colors p-2"
              title="開く"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
          </CardFooter>
        </div>
      </div>
    </Card>
  );
}
