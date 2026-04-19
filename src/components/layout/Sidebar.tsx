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
    <aside className="flex flex-col w-60 min-h-screen bg-surface border-r border-border flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent">
          <Film size={18} className="text-accent-foreground" />
        </div>
        <span className="font-bold text-lg text-text-primary tracking-tight">
          doobdeck
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent-subtle text-accent"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
              )}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <p className="text-xs text-text-disabled text-center">
          doobdeck · v0.1.0
        </p>
      </div>
    </aside>
  );
}

export { Sidebar };
