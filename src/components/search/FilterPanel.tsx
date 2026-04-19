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
    <div className={cn("flex items-center gap-3 flex-wrap", className)}>
      <div className="flex items-center gap-1.5 text-xs text-text-muted">
        <Filter size={13} />
        <span>Filter:</span>
      </div>

      <select
        value={currentFolder}
        onChange={(e) => updateFilter("folderId", e.target.value)}
        className="h-8 rounded-md border border-border bg-surface px-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
      >
        <option value="">All folders</option>
        {folders.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>

      <select
        value={currentCategory}
        onChange={(e) => updateFilter("categoryId", e.target.value)}
        className="h-8 rounded-md border border-border bg-surface px-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
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
        className="h-8 rounded-md border border-border bg-surface px-2 text-xs text-text-primary focus:outline-none focus:ring-1 focus:ring-accent"
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
          className="flex items-center gap-1 h-8 px-2 text-xs text-danger hover:text-danger-dim transition-colors"
        >
          <X size={12} />
          Clear
        </button>
      )}
    </div>
  );
}

export { FilterPanel };
