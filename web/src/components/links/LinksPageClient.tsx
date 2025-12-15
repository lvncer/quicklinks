"use client";

import LinkList from "@/components/links/LinkList";
import LinksFilterPanel from "@/components/links/LinksFilterPanel";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function LinksPageClient() {
  const searchParams = useSearchParams();

  const active = useMemo(() => {
    const from = searchParams.get("from") ?? "";
    const to = searchParams.get("to") ?? "";
    const domain = searchParams.get("domain") ?? "";
    const tags = searchParams
      .getAll("tag")
      .map((t) => t.trim())
      .filter(Boolean);

    const limitRaw = searchParams.get("limit") ?? "50";
    const limitNum = Number(limitRaw);
    const limit = Number.isFinite(limitNum)
      ? Math.min(100, Math.max(1, limitNum))
      : 50;

    return {
      from,
      to,
      domain,
      tags,
      limit,
    };
  }, [searchParams]);

  return (
    <>
      <LinksFilterPanel active={active} />

      <LinkList
        limit={active.limit}
        from={active.from || undefined}
        to={active.to || undefined}
        domain={active.domain || undefined}
        tags={active.tags.length > 0 ? active.tags : undefined}
      />
    </>
  );
}
