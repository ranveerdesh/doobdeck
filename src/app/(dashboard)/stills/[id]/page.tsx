import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Clapperboard, Pencil, Trash2, User } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ColourSwatches } from "@/components/stills/ColourSwatches";
import type { Metadata } from "next";
import DeleteStillButton from "./DeleteStillButton";

interface StillPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: StillPageProps): Promise<Metadata> {
  const { id } = await params;
  const still = await prisma.still.findUnique({
    where: { id },
    select: { title: true },
  });
  return { title: still?.title ?? "Still" };
}

export default async function StillPage({ params }: StillPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const { id } = await params;

  const still = await prisma.still.findUnique({
    where: { id },
    include: {
      folder: true,
      category: true,
      tags: { include: { tag: true } },
      colours: { orderBy: { population: "desc" } },
    },
  });

  if (!still || still.userId !== session.user.id) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/library"
        className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft size={14} />
        Back to library
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <div className="relative aspect-video overflow-hidden rounded-md border border-border/80 bg-surface-container-low shadow-card">
            <Image
              src={still.imageUrl}
              alt={still.title}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
              priority
            />
          </div>

          {still.colours.length > 0 && (
            <div className="mt-4 rounded-md border border-border/80 bg-surface-container-low/75 p-4">
              <h3 className="mb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-text-muted">
                Colour palette
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {still.colours.map((c) => (
                  <div key={c.id} className="flex flex-col items-center gap-1">
                    <div
                      className="h-8 w-8 rounded-md border border-white/10"
                      style={{ backgroundColor: c.hex }}
                      title={c.name ?? c.hex}
                    />
                    <span className="font-mono text-[9px] text-text-muted">
                      {c.hex}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-5 lg:col-span-2">
          <div className="flex items-start justify-between gap-3 rounded-md border border-border/80 bg-surface-container-low/60 p-4">
            <h1 className="text-xl font-semibold tracking-tight text-text-primary leading-tight">
              {still.title}
            </h1>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Link
                href={`/stills/${still.id}/edit`}
                className="rounded-md border border-border/70 p-2 text-text-muted transition-colors hover:bg-white/[0.03] hover:text-text-primary"
                title="Edit"
              >
                <Pencil size={15} />
              </Link>
              <DeleteStillButton stillId={still.id} />
            </div>
          </div>

          <div className="space-y-3 rounded-md border border-border/80 bg-surface-container-low/60 p-4">
            {still.filmName && (
              <div className="flex items-center gap-2">
                <Clapperboard size={14} className="text-accent flex-shrink-0" />
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-secondary">
                  {still.filmName}
                </span>
              </div>
            )}
            {still.director && (
              <div className="flex items-center gap-2">
                <User size={14} className="text-text-muted flex-shrink-0" />
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-secondary">
                  {still.director}
                </span>
              </div>
            )}
            {still.year && (
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-text-muted flex-shrink-0" />
                <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-text-secondary">{still.year}</span>
              </div>
            )}
          </div>

          {still.description && (
            <div className="rounded-md border border-border/80 bg-surface-container-low/60 p-4">
              <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.24em] text-text-muted">
                Description
              </p>
              <p className="text-sm leading-relaxed text-text-secondary">
                {still.description}
              </p>
            </div>
          )}

          {still.notes && (
            <div className="rounded-md border border-border/80 bg-surface-container-low/60 p-4">
              <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.24em] text-text-muted">
                Notes
              </p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">
                {still.notes}
              </p>
            </div>
          )}

          {still.folder && (
            <div className="rounded-md border border-border/80 bg-surface-container-low/60 p-4">
              <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.24em] text-text-muted">
                Folder
              </p>
              <Badge variant="default">{still.folder.name}</Badge>
            </div>
          )}

          {still.category && (
            <div className="rounded-md border border-border/80 bg-surface-container-low/60 p-4">
              <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.24em] text-text-muted">
                Category
              </p>
              <Badge variant="accent">{still.category.name}</Badge>
            </div>
          )}

          {still.tags.length > 0 && (
            <div className="rounded-md border border-border/80 bg-surface-container-low/60 p-4">
              <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.24em] text-text-muted">
                Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {still.tags.map(({ tag }) => (
                  <Badge key={tag.id} variant="muted">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-border/80 pt-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-muted">
              Added{" "}
              {new Date(still.createdAt).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
