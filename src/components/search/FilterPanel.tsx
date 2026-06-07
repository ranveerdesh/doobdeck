"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter, X } from "lucide-react";
import type { Folder, Category, Tag } from "@prisma/client";
import { cn } from "@/lib/cn";

interface FilterPanelProps {
  folders: Folder[];
  categories: Category[];
  tags: Tag[];
  className?: string;
}

function FilterPanel({ folders, categories, tags, className }: FilterPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentFolder = searchParams.get("folderId") ?? "";
  const currentCategory = searchParams.get("categoryId") ?? "";
  const currentTag = searchParams.get("tag") ?? "";
  const currentQ = searchParams.get("q") ?? "";

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/library?${params.toString()}`);
  };

  const clearAll = () => {
    router.push("/library");
  };

  const hasFilters = currentFolder || currentCategory || currentTag || currentQ;

  return (
    <div className={cn("flex flex-wrap items-center gap-3 rounded-md border border-border/80 bg-surface-container-low/60 p-3", className)}>
      <div className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
        <Filter size={13} />
        <span>Filter:</span>
      </div>

      <select
        value={currentFolder}
        onChange={(e) => updateFilter("folderId", e.target.value)}
        className="h-9 rounded-md border border-border/80 bg-surface-container-low/80 px-2.5 text-xs text-text-primary focus:border-accent/70 focus:outline-none focus:ring-1 focus:ring-accent/30"
      >
        <option value="">All decks</option>
        {folders.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>

      <select
        value={currentCategory}
        onChange={(e) => updateFilter("categoryId", e.target.value)}
        className="h-9 rounded-md border border-border/80 bg-surface-container-low/80 px-2.5 text-xs text-text-primary focus:border-accent/70 focus:outline-none focus:ring-1 focus:ring-accent/30"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      <select
        value={currentTag}
        onChange={(e) => updateFilter("tag", e.target.value)}
        className="h-9 rounded-md border border-border/80 bg-surface-container-low/80 px-2.5 text-xs text-text-primary focus:border-accent/70 focus:outline-none focus:ring-1 focus:ring-accent/30"
      >
        <option value="">All tags</option>
        {tags.map((t) => (
          <option key={t.id} value={t.name}>
            {t.name}
          </option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex h-9 items-center gap-1 rounded-md px-2.5 text-xs text-danger transition-colors hover:bg-danger-subtle hover:text-danger-dim"
        >
          <X size={12} />
          Clear
        </button>
      )}
    </div>
  );
}

export { FilterPanel };
