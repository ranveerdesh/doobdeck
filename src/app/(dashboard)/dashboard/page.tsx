import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Clock, Folder, Images, Tag, UploadCloud } from "lucide-react";
import { StillCard } from "@/components/stills/StillCard";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const userId = session.user.id;

  const [totalStills, totalFolders, totalCategories, recentStills] =
    await Promise.all([
      prisma.still.count({ where: { userId } }),
      prisma.folder.count({ where: { userId } }),
      prisma.category.count({ where: { userId } }),
      prisma.still.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 8,
        include: {
          folder: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
          tags: { include: { tag: { select: { id: true, name: true } } } },
          colours: {
            select: { id: true, hex: true, name: true, population: true },
            orderBy: { population: "desc" },
            take: 6,
          },
        },
      }),
    ]);

  const stats = [
    {
      label: "Total Stills",
      value: totalStills,
      icon: Images,
      href: "/library",
    },
    {
      label: "Folders",
      value: totalFolders,
      icon: Folder,
      href: "/folders",
    },
    {
      label: "Categories",
      value: totalCategories,
      icon: Tag,
      href: "/categories",
    },
  ];
  const firstName = session.user.name?.split(" ")[0];

  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
        <div className="space-y-5 rounded-md border border-border/80 bg-surface-container-low/75 p-6 shadow-card sm:p-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-text-muted">
                dashboard
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
                Welcome back{firstName ? `, ${firstName}` : ""}
              </h1>
            </div>
            <div className="hidden rounded-sm border border-border/70 bg-surface-raised px-3 py-2 text-right lg:block">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-text-muted">
                archive status
              </p>
              <p className="mt-1 text-sm text-text-primary">
                {totalStills} stills indexed
              </p>
            </div>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
            Here&apos;s a quick read on your archive: collection size, recent uploads, and where to continue cataloguing.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-colors hover:brightness-105"
            >
              <UploadCloud size={16} />
              Upload a still
            </Link>
            <Link
              href="/library"
              className="inline-flex items-center gap-2 border border-border/80 bg-surface/70 px-5 py-3 text-sm font-medium text-text-secondary transition-colors hover:border-border hover:bg-surface-raised hover:text-text-primary"
            >
              <Clock size={16} />
              View library
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <div className="rounded-md border border-border/80 bg-surface-container-high/80 p-5 shadow-card">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
              archive profile
            </p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">
              {totalStills} assets
            </p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              {totalFolders} folders and {totalCategories} categories currently organized in the collection.
            </p>
          </div>
          <div className="rounded-md border border-border/80 bg-surface-container-high/80 p-5 shadow-card">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-text-muted">
              current focus
            </p>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">
              Recent uploads
            </p>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Latest work appears first, keeping the newest stills ready for review and tagging.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-4 border border-border/80 bg-surface-container-low/75 p-5 transition-colors hover:border-border hover:bg-surface-container/85"
          >
            <div className="flex h-12 w-12 items-center justify-center border border-accent/20 bg-accent-subtle">
              <Icon size={20} className="text-accent" />
            </div>
            <div>
              <p className="text-3xl font-semibold tracking-tight text-text-primary">{value}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {totalStills === 0 && (
        <div className="flex flex-col items-center gap-4 border border-dashed border-border/80 bg-surface-container-low/60 py-14 text-center">
          <div className="border border-border/70 bg-surface-raised p-3">
            <UploadCloud size={28} className="text-text-muted" />
          </div>
          <div>
            <p className="font-medium text-text-primary">No stills yet</p>
            <p className="mt-1 text-sm text-text-muted">
              Upload your first film still to get started.
            </p>
          </div>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-colors hover:brightness-105"
          >
            <UploadCloud size={16} />
            Upload a still
          </Link>
        </div>
      )}

      {recentStills.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-text-muted">
                recent uploads
              </p>
              <h2 className="mt-2 flex items-center gap-2 text-lg font-semibold tracking-tight text-text-primary">
                <Clock size={16} className="text-text-muted" />
                Contact sheet
              </h2>
            </div>
            <Link
              href="/library"
              className="text-sm text-accent transition-colors hover:text-accent-dim"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {recentStills.map((still) => (
              <StillCard key={still.id} still={still} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}