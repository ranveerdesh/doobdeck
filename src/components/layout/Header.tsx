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
    <header className="sticky top-0 z-10 flex items-center gap-4 h-14 px-6 bg-background/80 backdrop-blur border-b border-border">
      <div className="flex-1">
        <SearchBar />
      </div>

      <div className="relative">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors"
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold">
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
            <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-border bg-surface-raised shadow-modal z-20 py-1 animate-fade-in">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-xs text-text-muted truncate">
                  {session?.user?.email}
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="flex w-full items-center gap-2 px-3 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-overlay transition-colors"
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
