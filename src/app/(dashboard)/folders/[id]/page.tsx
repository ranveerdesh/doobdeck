import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { StillGrid } from "@/components/stills/StillGrid";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface FolderDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: FolderDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const folder = await prisma.folder.findUnique({ where: { id }, select: { name: true } });

  return {
    title: folder ? `${folder.name} · Deck` : "Deck",
  };
}

export default async function FolderDetailPage({ params }: FolderDetailPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const userId = session.user.id;
  const { id } = await params;

  const folder = await prisma.folder.findFirst({
    where: { id, userId },
    include: {
      stills: {
        orderBy: { createdAt: "desc" },
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
      },
    },
  });

  if (!folder) notFound();

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <Link
          href="/folders"
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-text-muted transition-colors hover:bg-white/[0.03] hover:text-text-primary"
        >
          <ArrowLeft size={14} />
          Back to decks
        </Link>

        <p className="font-mono text-xs uppercase tracking-[0.32em] text-text-muted">
          Deck
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          {folder.name}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
          {folder.stills.length} still{folder.stills.length !== 1 ? "s" : ""} inside this deck.
        </p>
      </section>

      <StillGrid
        stills={folder.stills}
        emptyMessage="No stills in this deck yet. Upload a still and assign it here."
      />
    </div>
  );
}