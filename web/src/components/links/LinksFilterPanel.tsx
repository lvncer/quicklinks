"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

export type LinksListActiveFilters = {
  from: string;
  to: string;
  domain: string;
  tags: string[];
  limit: number;
};

function parseTagsInput(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(/[\s,]+/)
        .map((t) => t.trim())
        .filter(Boolean),
    ),
  );
}

export default function LinksFilterPanel({
  active,
}: {
  active: LinksListActiveFilters;
}) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [fromInput, setFromInput] = useState(active.from);
  const [toInput, setToInput] = useState(active.to);
  const [domainInput, setDomainInput] = useState(active.domain);
  const [tagsInput, setTagsInput] = useState(active.tags.join(", "));

  const badges = useMemo(() => {
    const b: Array<{ key: string; label: string }> = [];
    if (active.from) b.push({ key: "from", label: `from: ${active.from}` });
    if (active.to) b.push({ key: "to", label: `to: ${active.to}` });
    if (active.domain)
      b.push({ key: "domain", label: `domain: ${active.domain}` });
    for (const t of active.tags) {
      const trimmed = t.trim();
      if (!trimmed) continue;
      b.push({ key: `tag:${trimmed}`, label: `tag: ${trimmed}` });
    }
    return b;
  }, [active.domain, active.from, active.tags, active.to]);

  const hasAnyActive = badges.length > 0;

  const openPanel = () => {
    // When opening, sync the form inputs to the currently active URL state.
    setFromInput(active.from);
    setToInput(active.to);
    setDomainInput(active.domain);
    setTagsInput(active.tags.join(", "));
    setIsOpen(true);
  };

  const closePanel = () => {
    setIsOpen(false);
  };

  const applyFilters = () => {
    const next = new URLSearchParams();

    // Preserve limit if present.
    if (active.limit !== 50) next.set("limit", String(active.limit));

    if (fromInput) next.set("from", fromInput);
    if (toInput) next.set("to", toInput);
    if (domainInput) next.set("domain", domainInput);

    const tags = parseTagsInput(tagsInput);
    for (const t of tags) next.append("tag", t);

    const qs = next.toString();
    router.replace(qs ? `/?${qs}` : "/");
  };

  const clearFilters = () => {
    setFromInput("");
    setToInput("");
    setDomainInput("");
    setTagsInput("");
    router.replace("/");
  };

  return (
    <section className="mb-6 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold">フィルター</h2>
            {!hasAnyActive && (
              <span className="text-xs text-muted-foreground">条件なし</span>
            )}
          </div>

          {hasAnyActive && (
            <div className="flex flex-wrap gap-2">
              {badges.map((b) => (
                <Badge key={b.key} variant="secondary">
                  {b.label}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={isOpen ? closePanel : openPanel}
          >
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {hasAnyActive && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="px-2"
              onClick={clearFilters}
            >
              全クリア
            </Button>
          )}
        </div>
      </div>

      {isOpen && (
        <div className="mt-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                期間（from）
              </label>
              <input
                type="date"
                value={fromInput}
                onChange={(e) => setFromInput(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                期間（to）
              </label>
              <input
                type="date"
                value={toInput}
                onChange={(e) => setToInput(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                ドメイン
              </label>
              <input
                type="text"
                value={domainInput}
                onChange={(e) => setDomainInput(e.target.value)}
                placeholder="example.com"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-muted-foreground">
                タグ（カンマ/スペース区切り）
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="dev, ai"
                className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={applyFilters}>
              適用
            </Button>
            <Button type="button" variant="outline" onClick={clearFilters}>
              クリア
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            URL にフィルタ条件を保持します（共有・再現できます）。
          </p>
        </div>
      )}
    </section>
  );
}
