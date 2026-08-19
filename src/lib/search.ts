import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { StillSummary } from "@/types";

const stillInclude = {
  folder: { select: { id: true, name: true } },
  category: { select: { id: true, name: true } },
  tags: { include: { tag: { select: { id: true, name: true } } } },
  colours: {
    select: { id: true, hex: true, name: true, population: true },
    orderBy: { population: "desc" as const },
    take: 6,
  },
};

interface SearchParams {
  userId: string;
  q?: string;
  folderId?: string;
  categoryId?: string;
  tag?: string;
  page: number;
  limit: number;
}

export async function searchStills({
  userId,
  q,
  folderId,
  categoryId,
  tag,
  page,
  limit,
}: SearchParams): Promise<{ stills: StillSummary[]; total: number }> {
  const skip = (page - 1) * limit;

  if (!q) {
    const where: Prisma.StillWhereInput = {
      userId,
      ...(folderId ? { folderId } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(tag ? { tags: { some: { tag: { name: tag, userId } } } } : {}),
    };

    const [stills, total] = await Promise.all([
      prisma.still.findMany({
        where,
        orderBy: [
          { releaseDate: { sort: "desc", nulls: "last" } },
          { createdAt: "desc" },
          { id: "asc" },
        ],
        skip,
        take: limit,
        include: stillInclude,
      }),
      prisma.still.count({ where }),
    ]);

    return { stills: stills as StillSummary[], total };
  }

  const qLike = `%${q.trim()}%`;
  const qText = q.trim();

  const commonWhere = Prisma.sql`
    s."userId" = ${userId}
    ${folderId ? Prisma.sql`AND s."folderId" = ${folderId}` : Prisma.empty}
    ${categoryId ? Prisma.sql`AND s."categoryId" = ${categoryId}` : Prisma.empty}
    ${tag
      ? Prisma.sql`
        AND EXISTS (
          SELECT 1 FROM "StillTag" st
          JOIN "Tag" tg ON tg.id = st."tagId"
          WHERE st."stillId" = s.id
            AND tg."userId" = ${userId}
            AND tg.name = ${tag}
        )`
      : Prisma.empty}
  `;

  const searchWhere = Prisma.sql`
    (
      to_tsvector(
        'english'::regconfig,
        coalesce(s.title, '') || ' ' ||
        coalesce(s."filmName", '') || ' ' ||
        coalesce(s.description, '') || ' ' ||
        coalesce(s.director, '') || ' ' ||
        coalesce(s.cinematographer, '') || ' ' ||
        coalesce(s.editor, '') || ' ' ||
        coalesce(s.actor, '') || ' ' ||
        coalesce(s.notes, '') || ' ' ||
        coalesce(s."shotType", '') || ' ' ||
        coalesce(s.composition, '') || ' ' ||
        coalesce(s.lighting, '') || ' ' ||
        coalesce(s."interiorExterior", '') || ' ' ||
        coalesce(s."timeOfDay", '') || ' ' ||
        coalesce(s."aspectRatio", '') || ' ' ||
        coalesce(s.resolution, '') || ' ' ||
        coalesce(s."lensSize", '') || ' ' ||
        coalesce(s."lensType", '') || ' ' ||
        coalesce(s."opticalFormat", '') || ' ' ||
        coalesce(s.colour, '') || ' ' ||
        coalesce(s."set", '') || ' ' ||
        coalesce(extract(year from s."releaseDate")::text, '')
      ) @@ websearch_to_tsquery('english', ${qText})
      OR s."colourTags" && ARRAY[${qText}]::text[]
      OR s."collaborator" && ARRAY[${qText}]::text[]
      OR EXISTS (
        SELECT 1 FROM "StillTag" st
        JOIN "Tag" tg ON tg.id = st."tagId"
        WHERE st."stillId" = s.id
          AND tg."userId" = ${userId}
          AND tg.name ILIKE ${qLike}
      )
      OR EXISTS (
        SELECT 1 FROM "Colour" col
        WHERE col."stillId" = s.id
          AND (col.hex ILIKE ${qLike} OR coalesce(col.name, '') ILIKE ${qLike})
      )
      OR EXISTS (
        SELECT 1 FROM "Folder" f
        WHERE f.id = s."folderId"
          AND f.name ILIKE ${qLike}
      )
      OR EXISTS (
        SELECT 1 FROM "Category" c
        WHERE c.id = s."categoryId"
          AND c.name ILIKE ${qLike}
      )
    )
  `;

  const [idsResult, countResult] = await Promise.all([
    prisma.$queryRaw<Array<{ id: string }>>`
      SELECT s.id
      FROM "Still" s
      WHERE ${commonWhere}
        AND ${searchWhere}
      ORDER BY s."releaseDate" DESC NULLS LAST, s."createdAt" DESC, s.id ASC
      LIMIT ${limit} OFFSET ${skip}
    `,
    prisma.$queryRaw<Array<{ count: string }>>`
      SELECT count(*)::text as count
      FROM "Still" s
      WHERE ${commonWhere}
        AND ${searchWhere}
    `,
  ]);

  const ids = idsResult.map((r) => r.id);
  const total = countResult.length ? Number(countResult[0].count) : 0;

  if (ids.length === 0) return { stills: [], total };

  const stills = await prisma.still.findMany({
    where: { id: { in: ids } },
    orderBy: [
      { releaseDate: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
      { id: "asc" },
    ],
    include: stillInclude,
  });

  return { stills: stills as StillSummary[], total };
}
