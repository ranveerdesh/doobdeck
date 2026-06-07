import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getCloudinaryStorageSummary } from "@/lib/cloudinary-usage";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Clock, Folder, Images, Tag, UploadCloud } from "lucide-react";
import { StillCard } from "@/components/stills/StillCard";
import { LatestStillLink } from "@/components/stills/LatestStillLink";
import type { Metadata } from "next";
import type { StillSummary } from "@/types";

export const metadata: Metadata = { title: "Dashboard" };

function formatBytes(value: number): string {
  const units = ["B", "KB", "MB", "GB", "TB"];
  if (value <= 0) return "0 B";
  const exponent = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  const size = value / 1024 ** exponent;
  const decimals = exponent === 0 ? 0 : size < 10 ? 2 : 1;
  return `${size.toFixed(decimals)} ${units[exponent]}`;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const userId = session.user.id;

  const [totalStills, totalFolders, totalCategories, recentStills, storageSummary]: [
    number,
    number,
    number,
    any[],
    Awaited<ReturnType<typeof getCloudinaryStorageSummary>>
  ] = await Promise.all([
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
      getCloudinaryStorageSummary(),
    ]);

  const stats = [
    {
      label: "Total Stills",
      value: totalStills,
      icon: Images,
      href: "/library",
      accent: "Library",
      valueSuffix: "Stills",
    },
    {
      label: "Folders",
      value: totalFolders,
      icon: Folder,
      href: "/folders",
      accent: "Decks",
      valueSuffix: "Folders",
    },
    {
      label: "Categories",
      value: totalCategories,
      icon: Tag,
      href: "/categories",
      accent: "Categories",
      valueSuffix: "Categories",
    },
  ];
  const displayName =
    session.user.name?.trim() ||
    session.user.email?.split("@")[0]?.replace(/[._-]+/g, " ") ||
    "there";
  const latestStillTitle = recentStills[0]?.title ?? "the latest still";
  const recentStillsTyped: StillSummary[] = (recentStills as unknown) as StillSummary[];

  return (
    <div className="space-y-8 lg:space-y-10">
      <section className="space-y-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <h1 className="text-[34px] font-bold tracking-[-0.035em] text-text-primary sm:text-[40px] sm:leading-[1.08] lg:text-[48px] lg:leading-[1.05]">
              Welcome back, {displayName}
            </h1>
            <p className="max-w-2xl text-[13px] font-light leading-[1.65] tracking-[0.005em] text-text-secondary sm:text-[15px]">
              Your cinematic library is {totalStills} stills big!. The latest additions are <LatestStillLink still={recentStills[0]} fallbackTitle={latestStillTitle} />.
            </p>
          </div>

          <Link
            href="/upload"
            className="inline-flex items-center justify-center gap-2 self-start rounded-[6px] border border-[#f2b37b]/40 bg-[#f2b37b] px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#151312] shadow-[0_8px_24px_rgba(242,179,123,0.15)] transition-all hover:border-[#f2b37b]/60 hover:brightness-105 active:scale-[0.99] sm:px-6 sm:py-3.5"
          >
            <UploadCloud size={16} />
            Upload stills
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, href, accent, valueSuffix }) => (
          <Link
            key={label}
            href={href}
            className="group relative min-h-[118px] rounded-[6px] border border-[#2a2624] bg-[#1d1b1a] px-4 py-3 shadow-[0_1px_0_rgba(255,255,255,0.02),0_10px_30px_rgba(0,0,0,0.18)] transition-all duration-300 hover:border-[#3a332f] hover:bg-[#201d1c]"
          >
            <div className="mb-7 flex items-start justify-between">
              <Icon size={14} className="text-[#c58c59]" strokeWidth={1.9} />
              <ArrowUpRight size={12} className="text-text-muted/20 transition-colors group-hover:text-[#c58c59]" />
            </div>
            <p className="mb-2 font-mono text-[8px] uppercase tracking-[0.3em] text-text-muted/90">
              {accent}
            </p>
            <p className="text-[19px] font-semibold tracking-[-0.02em] text-text-primary">
              {`${value} ${valueSuffix}`}
            </p>
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
              <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight text-text-primary sm:text-lg">
                <Clock size={16} className="text-text-muted" />
                Recent uploads
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
            {recentStills.slice(0, 8).map((still, index) => (
              <StillCard key={still.id} still={still} stills={recentStills} index={index} />
            ))}
          </div>
        </div>
      )}

      <section className="rounded-[6px] border border-[#2a2624] bg-[#1d1b1a] p-5 shadow-[0_1px_0_rgba(255,255,255,0.02),0_10px_30px_rgba(0,0,0,0.18)]">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-text-muted/90">
              Storage
            </p>
          </div>
          {storageSummary && (
            <p className="text-sm text-text-secondary">
              {storageSummary.usagePercent.toFixed(1)}% used
            </p>
          )}
        </div>

        {storageSummary ? (
          <>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/25">
              <div
                className="h-full rounded-full bg-[#c58c59] transition-[width] duration-500"
                style={{ width: `${storageSummary.usagePercent}%` }}
              />
            </div>
            <div className="mt-3 grid gap-2 text-sm text-text-secondary sm:grid-cols-3">
              <p>
                Left: <span className="font-semibold text-text-primary">{formatBytes(storageSummary.remainingBytes)}</span>
              </p>
              <p>
                Used: <span className="font-semibold text-text-primary">{formatBytes(storageSummary.usedBytes)}</span>
              </p>
              <p>
                Total: <span className="font-semibold text-text-primary">{formatBytes(storageSummary.limitBytes)}</span>
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-text-muted">
            Storage details are currently unavailable.
          </p>
        )}
      </section>
    </div>
  );
}