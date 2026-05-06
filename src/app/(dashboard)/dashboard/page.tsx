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

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.32em] text-text-muted">
          dashboard
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          Welcome back{session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
          Here&apos;s a quick read on your archive: collection size, recent uploads, and where to continue cataloguing.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-4 rounded-md border border-border/80 bg-surface-container-low/75 p-5 transition-colors hover:border-border hover:bg-surface-container/85"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-md border border-accent/20 bg-accent-subtle">
              <Icon size={20} className="text-accent" />
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight text-text-primary">{value}</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {totalStills === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-md border border-dashed border-border/80 bg-surface-container-low/60 py-14 text-center">
          <div className="rounded-md border border-border/70 bg-surface-raised p-3">
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
            className="inline-flex items-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-medium text-accent-foreground transition-colors hover:brightness-105"
          >
            <UploadCloud size={16} />
            Upload a still
          </Link>
        </div>
      )}

      {recentStills.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight text-text-primary">
              <Clock size={16} className="text-text-muted" />
              Recent uploads
            </h2>
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