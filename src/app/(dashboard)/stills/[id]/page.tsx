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
  params: { id: string };
}

export async function generateMetadata({ params }: StillPageProps): Promise<Metadata> {
  const still = await prisma.still.findUnique({
    where: { id: params.id },
    select: { title: true },
  });
  return { title: still?.title ?? "Still" };
}

export default async function StillPage({ params }: StillPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const still = await prisma.still.findUnique({
    where: { id: params.id },
    include: {
      folder: true,
      category: true,
      tags: { include: { tag: true } },
      colours: { orderBy: { population: "desc" } },
    },
  });

  if (!still || still.userId !== session.user.id) notFound();

  return (
    <div className="max-w-4xl space-y-6">
      {/* Back nav */}
      <Link
        href="/library"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft size={14} />
        Back to library
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Image */}
        <div className="lg:col-span-3">
          <div className="relative aspect-video rounded-xl overflow-hidden bg-surface">
            <Image
              src={still.imageUrl}
              alt={still.title}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
              priority
            />
          </div>

          {/* Colour palette */}
          {still.colours.length > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-surface-raised border border-border">
              <h3 className="text-xs font-medium text-text-muted uppercase tracking-wider mb-3">
                Colour Palette
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                {still.colours.map((c) => (
                  <div key={c.id} className="flex flex-col items-center gap-1">
                    <div
                      className="w-8 h-8 rounded-lg border border-white/10"
                      style={{ backgroundColor: c.hex }}
                      title={c.name ?? c.hex}
                    />
                    <span className="text-[9px] text-text-muted font-mono">
                      {c.hex}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-start justify-between gap-2">
            <h1 className="text-xl font-bold text-text-primary leading-tight">
              {still.title}
            </h1>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Link
                href={`/stills/${still.id}/edit`}
                className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
                title="Edit"
              >
                <Pencil size={15} />
              </Link>
              <DeleteStillButton stillId={still.id} />
            </div>
          </div>

          <div className="space-y-3">
            {still.filmName && (
              <div className="flex items-center gap-2">
                <Clapperboard size={14} className="text-accent flex-shrink-0" />
                <span className="text-sm text-text-secondary">
                  {still.filmName}
                </span>
              </div>
            )}
            {still.director && (
              <div className="flex items-center gap-2">
                <User size={14} className="text-text-muted flex-shrink-0" />
                <span className="text-sm text-text-secondary">
                  {still.director}
                </span>
              </div>
            )}
            {still.year && (
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-text-muted flex-shrink-0" />
                <span className="text-sm text-text-secondary">{still.year}</span>
              </div>
            )}
          </div>

          {still.description && (
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
                Description
              </p>
              <p className="text-sm text-text-secondary leading-relaxed">
                {still.description}
              </p>
            </div>
          )}

          {still.notes && (
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
                Notes
              </p>
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                {still.notes}
              </p>
            </div>
          )}

          {still.folder && (
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
                Folder
              </p>
              <Badge variant="default">{still.folder.name}</Badge>
            </div>
          )}

          {still.category && (
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
                Category
              </p>
              <Badge variant="accent">{still.category.name}</Badge>
            </div>
          )}

          {still.tags.length > 0 && (
            <div>
              <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-1.5">
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

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-text-disabled">
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
