"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
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
       <span
         className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]"
         style={{ fontVariationSettings: "'FILL' 1" }}
       >
         search
       </span>
      <input
        ref={inputRef}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-full border border-outline-variant/10 bg-surface-container-high/90 py-2 pl-10 pr-4 font-mono text-[13px] tracking-wide text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
      />
      {value && (
        <button
          onClick={() => setValue("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-muted transition-colors hover:text-text-primary"
          aria-label="Clear search"
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
}

export { SearchBar };
