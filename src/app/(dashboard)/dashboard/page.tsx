import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Images, Folder, Tag, UploadCloud, Clock } from "lucide-react";
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
    <div className="space-y-8 max-w-7xl">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Welcome back
          {session.user.name ? `, ${session.user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Here&apos;s an overview of your film stills collection.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-4 p-5 rounded-xl bg-surface-raised border border-border hover:border-border-strong transition-colors"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent-subtle">
              <Icon size={20} className="text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-text-primary">{value}</p>
              <p className="text-xs text-text-muted">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Upload CTA */}
      {totalStills === 0 && (
        <div className="flex flex-col items-center gap-4 py-12 rounded-xl border-2 border-dashed border-border text-center">
          <div className="p-3 rounded-full bg-surface-raised">
            <UploadCloud size={28} className="text-text-muted" />
          </div>
          <div>
            <p className="text-text-primary font-medium">No stills yet</p>
            <p className="text-sm text-text-muted mt-1">
              Upload your first film still to get started.
            </p>
          </div>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-accent text-accent-foreground font-medium text-sm hover:bg-accent-dim transition-colors"
          >
            <UploadCloud size={16} />
            Upload a still
          </Link>
        </div>
      )}

      {/* Recent stills */}
      {recentStills.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-text-primary">
              <Clock size={16} className="text-text-muted" />
              Recent uploads
            </h2>
            <Link
              href="/library"
              className="text-sm text-accent hover:text-accent-dim transition-colors"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recentStills.map((still) => (
              <StillCard key={still.id} still={still} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
