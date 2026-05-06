"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
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
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const debouncedValue = useDebounce(value, 400);

  useEffect(() => {
    const q = debouncedValue.trim();
    if (q) {
      router.push(`/library?q=${encodeURIComponent(q)}`);
    } else if (value === "" && searchParams.get("q")) {
      const currentPath = window.location.pathname;
      if (currentPath === "/library") {
        router.push("/library");
      }
    }
  }, [debouncedValue, router, value, searchParams]);

  return (
    <div className={cn("relative w-full max-w-2xl", className)}>
      <Search
        size={15}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
      />
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-md border border-border/80 bg-surface-container-low/90 pl-9 pr-9 font-mono text-sm tracking-wide text-text-primary placeholder:text-text-muted focus:border-accent/70 focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
      {value && (
        <button
          onClick={() => setValue("")}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-primary"
          aria-label="Clear search"
        >
          <X size={13} />
        </button>
      )}
    </div>
  );
}

export { SearchBar };
