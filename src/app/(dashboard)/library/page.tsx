import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { StillGrid } from "@/components/stills/StillGrid";
import { FilterPanel } from "@/components/search/FilterPanel";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { searchSchema } from "@/lib/validations";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Library" };

interface LibraryPageProps {
  searchParams: {
    q?: string;
    folderId?: string;
    categoryId?: string;
    tag?: string;
    page?: string;
  };
}

async function LibraryContent({
  userId,
  filters,
}: {
  userId: string;
  filters: ReturnType<typeof searchSchema.parse>;
}) {
  const { q, folderId, categoryId, tag, page, limit } = filters;
  const skip = (page - 1) * limit;

  const where = {
    userId,
    ...(folderId ? { folderId } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(tag
      ? { tags: { some: { tag: { name: tag, userId } } } }
      : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
            { filmName: { contains: q, mode: "insensitive" as const } },
            { director: { contains: q, mode: "insensitive" as const } },
            { folder: { name: { contains: q, mode: "insensitive" as const } } },
            {
              category: {
                name: { contains: q, mode: "insensitive" as const },
              },
            },
            {
              tags: {
                some: {
                  tag: { name: { contains: q, mode: "insensitive" as const } },
                },
              },
            },
          ],
        }
      : {}),
  };

  const [stills, total] = await Promise.all([
    prisma.still.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
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
    prisma.still.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-text-muted">
        <span>
          {total} still{total !== 1 ? "s" : ""}
          {q ? ` matching "${q}"` : ""}
        </span>
        {totalPages > 1 && (
          <span>
            Page {page} of {totalPages}
          </span>
        )}
      </div>

      <StillGrid
        stills={stills}
        emptyMessage={
          q
            ? `No stills found matching "${q}"`
            : "No stills yet. Upload your first still!"
        }
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {[
            page > 1 && { label: "Previous", targetPage: page - 1 },
            page < totalPages && { label: "Next", targetPage: page + 1 },
          ]
            .filter(Boolean)
            .map((item) => {
              if (!item) return null;
              const params = new URLSearchParams({
                ...(q ? { q } : {}),
                ...(folderId ? { folderId } : {}),
                ...(categoryId ? { categoryId } : {}),
                ...(tag ? { tag } : {}),
                page: String(item.targetPage),
              });
              return (
                <a
                  key={item.label}
                  href={`?${params.toString()}`}
                  className="px-3 py-1.5 rounded-md border border-border text-sm text-text-secondary hover:bg-surface-raised transition-colors"
                >
                  {item.label}
                </a>
              );
            })}
        </div>
      )}
    </div>
  );
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const userId = session.user.id;

  const filters = searchSchema.parse({
    q: searchParams.q,
    folderId: searchParams.folderId,
    categoryId: searchParams.categoryId,
    tag: searchParams.tag,
    page: searchParams.page,
  });

  const [folders, categories, tags] = await Promise.all([
    prisma.folder.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
    prisma.tag.findMany({
      where: { userId },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Library</h1>
        <p className="text-sm text-text-muted mt-1">
          All your film stills in one place.
        </p>
      </div>

      <Suspense>
        <FilterPanel folders={folders} categories={categories} tags={tags} />
      </Suspense>

      <Suspense fallback={<FullPageSpinner />}>
        <LibraryContent userId={userId} filters={filters} />
      </Suspense>
    </div>
  );
}
