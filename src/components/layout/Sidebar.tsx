"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Images,
  UploadCloud,
  Folder,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/Logo";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/library", label: "Library", icon: Images },
  { href: "/upload", label: "Upload", icon: UploadCloud },
  { href: "/folders", label: "Decks", icon: Folder },
  { href: "/categories", label: "Categories", icon: Tag },
];

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-border/70 bg-surface-container-lowest/95 backdrop-blur">
      <div className="border-b border-border/70 px-6 py-8">
        <div className="mb-2 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center shadow-card">
            <Logo size={40} />
          </div>
          <div className="leading-tight">
            <span className="block text-lg font-semibold tracking-tight text-text-primary">
              doobdeck
            </span>
            <span className="block text-[10px] uppercase tracking-[0.32em] text-text-muted font-mono">
              Cinematic Archive
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-4 px-5 py-3 text-[11px] uppercase tracking-[0.2em] transition-colors",
                isActive
                  ? "border-l-4 border-accent bg-white/[0.03] text-accent"
                  : "text-text-muted hover:bg-white/[0.02] hover:text-text-primary"
              )}
            >
              <Icon size={18} className={cn(isActive && "fill-current")} />
              <span>{label}</span>
              {!isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-accent opacity-0 transition-opacity group-hover:opacity-40" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-border/70 px-6 py-6">
        <p className="text-center font-mono text-[10px] uppercase tracking-[0.28em] text-text-muted">
          archive access
        </p>
        <p className="mt-2 text-center text-[11px] uppercase tracking-[0.24em] text-text-muted/70">
          doobdeck · v0.1.0
        </p>
      </div>
    </aside>
  );
}

export { Sidebar };
