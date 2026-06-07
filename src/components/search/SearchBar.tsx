"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

function SearchBar({ className, placeholder = "Search stills..." }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";
  const [value, setValue] = useState(currentQuery);
  const debouncedValue = useDebounce(value, 400);

  useEffect(() => {
    setValue(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    if (pathname !== "/library") {
      return;
    }

    const q = debouncedValue.trim();
    const normalizedCurrentQuery = currentQuery.trim();

    if (q === normalizedCurrentQuery) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());

    if (q) {
      params.set("q", q);
      params.delete("page");
    } else {
      params.delete("q");
      params.delete("page");
    }

    const queryString = params.toString();
    router.replace(queryString ? `/library?${queryString}` : "/library");
  }, [debouncedValue, currentQuery, pathname, router, searchParams]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const q = value.trim();
    router.push(q ? `/library?q=${encodeURIComponent(q)}` : "/library");
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative w-full max-w-2xl", className)}>
       <span
         className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]"
         style={{ fontVariationSettings: "'FILL' 1" }}
       >
         search
       </span>
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-outline-variant/10 bg-surface-container-high/90 py-2 pl-10 pr-4 font-mono text-[13px] tracking-wide text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
      />
    </form>
  );
}

export { SearchBar };
