"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Images,
  UploadCloud,
  Folder,
  Tag,
  Film,
} from "lucide-react";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/library", label: "Library", icon: Images },
  { href: "/upload", label: "Upload", icon: UploadCloud },
  { href: "/folders", label: "Folders", icon: Folder },
  { href: "/categories", label: "Categories", icon: Tag },
];

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col border-r border-border/80 bg-surface-container-lowest/95 backdrop-blur">
      <div className="flex items-center gap-3 border-b border-border/70 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-border/70 bg-accent text-accent-foreground shadow-card">
          <Film size={18} className="text-accent-foreground" />
        </div>
        <div>
          <span className="block text-[10px] uppercase tracking-[0.32em] text-text-muted font-mono">
            archive
          </span>
          <span className="block text-lg font-semibold tracking-tight text-text-primary">
            doobdeck
          </span>
        </div>
      </div>

      <nav className="flex-1 p-3">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-white/[0.03] text-accent"
                  : "text-text-muted hover:bg-white/[0.02] hover:text-text-primary"
              )}
            >
              <span
                className={cn(
                  "absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-accent transition-opacity",
                  isActive ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                )}
              />
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/70 p-4">
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.24em] text-text-muted">
          doobdeck · v0.1.0
        </p>
      </div>
    </aside>
  );
}

export { Sidebar };
