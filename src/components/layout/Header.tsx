"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { LogOut, User, ChevronDown } from "lucide-react";
import { SearchBar } from "@/components/search/SearchBar";
import { cn } from "@/lib/cn";

function Header() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-border/70 bg-background/70 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="flex-1 min-w-0">
        <SearchBar />
      </div>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 rounded-md border border-border/70 bg-surface/70 px-3 py-2 text-sm text-text-secondary transition-colors hover:border-border hover:bg-surface-raised hover:text-text-primary"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
            {session?.user?.name?.[0]?.toUpperCase() ??
              session?.user?.email?.[0]?.toUpperCase() ??
              "?"}
          </div>
          <span className="hidden sm:block max-w-[120px] truncate">
            {session?.user?.name ?? session?.user?.email}
          </span>
          <ChevronDown
            size={14}
            className={cn("transition-transform", menuOpen && "rotate-180")}
          />
        </button>

        {menuOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setMenuOpen(false)}
            />
            <div className="absolute right-0 top-full z-20 mt-2 w-52 rounded-md border border-border/80 bg-surface-container-high shadow-modal animate-fade-in">
              <div className="border-b border-border/70 px-3 py-2.5">
                <p className="truncate text-[11px] uppercase tracking-[0.18em] text-text-muted font-mono">
                  {session?.user?.email}
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-text-secondary transition-colors hover:bg-white/[0.03] hover:text-text-primary"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export { Header };
