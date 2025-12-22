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
import { ExternalLink, Globe, ImageIcon, Clock } from "lucide-react";
import Link from "next/link";
import useSWR from "swr";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { Link as LinkItem } from "@/types/links";
import { OgData } from "@/types/ogps";

export default function LinkCard({ link }: { link: LinkItem }) {
  const { getToken } = useAuth();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE;

  const apiUrl =
    apiBaseUrl && link.url
      ? `${apiBaseUrl}/api/og?url=${encodeURIComponent(link.url)}`
      : null;

  const ogFetcher = async (url: string) => {
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
      throw new Error(`Failed to fetch metadata: ${res.status}`);
    }

    return res.json();
  };

  // リアルタイムでOGPを取得
  const { data: ogData, isLoading } = useSWR<OgData>(
    apiUrl,
    apiUrl ? ogFetcher : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1分間は再取得しない
    },
  );

  // DBの値または取得したOGPデータを使用
  const displayImage = ogData?.image || link.og_image;
  const displayDesc = ogData?.description || link.description;
  const displayTitle = ogData?.title || link.title || "No Title";
  const showOgpBlockedNotice = !!ogData?.blocked;

  // 日付の表示ロジック
  // 保存日を表示（published_at/公開概念は撤去）
  const displayDate = link.saved_at;

  return (
    <Card className="group hover:shadow-md transition-all duration-300 hover:border-primary/50 overflow-hidden flex flex-col h-full bg-card/80 backdrop-blur-sm">
      <div className="flex flex-col md:flex-row h-full px-6">
        {/* 左側: OGP Image (16:9) */}
        <div className="relative w-full md:w-[280px] shrink-0">
          <div className="aspect-video w-full h-full relative">
            {isLoading ? (
              <Skeleton className="w-full h-full absolute inset-0" />
            ) : displayImage ? (
              <Image
                src={displayImage}
                alt={displayTitle}
                width={500}
                height={500}
                className="w-full h-full object-cover transition-transform duration-500 absolute inset-0 rounded-lg"
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
        <div className="flex flex-col min-w-0">
          <CardHeader>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
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

          <CardContent>
            {/* Description */}
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            ) : (
              <>
                {displayDesc && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {displayDesc}
                  </p>
                )}
                {showOgpBlockedNotice && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    このサイトは OGP
                    を取得できませんでした（サイト側の制限の可能性があります）
                  </p>
                )}
              </>
            )}

            {/* User Note */}
            {link.note && (
              <div className="bg-secondary/50 p-2.5 rounded-md text-xs text-secondary-foreground/90 italic border border-secondary mt-1">
                {link.note}
              </div>
            )}
          </CardContent>
        </div>
      </div>
      <CardFooter className="text-xs text-muted-foreground flex justify-between items-center">
        <div
          className="flex items-center gap-1.5"
          title={`保存日: ${displayDate}`}
        >
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(new Date(displayDate), {
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
    </Card>
  );
}
