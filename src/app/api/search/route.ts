import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { searchSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const filters = searchSchema.parse({
      q: searchParams.get("q") ?? undefined,
      folderId: searchParams.get("folderId") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      tag: searchParams.get("tag") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const { q, folderId, categoryId, tag, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where = {
      userId,
      ...(folderId ? { folderId } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(tag ? { tags: { some: { tag: { name: tag, userId } } } } : {}),
    };

    let stills = [] as any[];
    let total = 0;

    if (q) {
      const qLike = `%${q.trim()}%`;
      const qText = q.trim();

      const commonWhere = Prisma.sql`
        s."userId" = ${userId}
        ${folderId ? Prisma.sql`AND s."folderId" = ${folderId}` : Prisma.empty}
        ${categoryId ? Prisma.sql`AND s."categoryId" = ${categoryId}` : Prisma.empty}
        ${tag
          ? Prisma.sql`
            AND EXISTS (
              SELECT 1
              FROM "StillTag" st
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
            'english',
            concat_ws(
              ' ',
              coalesce(s.title, ''),
              coalesce(s."filmName", ''),
              coalesce(s.description, ''),
              coalesce(s.director, ''),
              coalesce(s.cinematographer, ''),
              coalesce(s.editor, ''),
              coalesce(s.actor, ''),
              coalesce(s.notes, ''),
              coalesce(s."shotType", ''),
              coalesce(s.composition, ''),
              coalesce(s.lighting, ''),
              coalesce(s."interiorExterior", ''),
              coalesce(s."timeOfDay", ''),
              coalesce(s."aspectRatio", ''),
              coalesce(s."frameSize", ''),
              coalesce(s."lensSize", ''),
              coalesce(s."set", ''),
              coalesce(s."year"::text, ''),
              coalesce(array_to_string(s."colourTags", ' '), ''),
              coalesce(f.name, ''),
              coalesce(c.name, '')
            )
          ) @@ websearch_to_tsquery('english', ${qText})
          OR s."year"::text ILIKE ${qLike}
          OR EXISTS (
            SELECT 1
            FROM "StillTag" st
            JOIN "Tag" tg ON tg.id = st."tagId"
            WHERE st."stillId" = s.id
              AND tg."userId" = ${userId}
              AND tg.name ILIKE ${qLike}
          )
          OR EXISTS (
            SELECT 1
            FROM "Colour" col
            WHERE col."stillId" = s.id
              AND (col.hex ILIKE ${qLike} OR coalesce(col.name, '') ILIKE ${qLike})
          )
        )
      `;

      const idsResult: Array<{ id: string }> = await prisma.$queryRaw`
        SELECT s.id
        FROM "Still" s
        LEFT JOIN "Folder" f ON f.id = s."folderId"
        LEFT JOIN "Category" c ON c.id = s."categoryId"
        WHERE ${commonWhere}
          AND ${searchWhere}
        ORDER BY s."createdAt" DESC
        LIMIT ${limit} OFFSET ${skip}
      `;

      const countResult: Array<{ count: string }> = await prisma.$queryRaw`
        SELECT count(*)::text as count
        FROM "Still" s
        LEFT JOIN "Folder" f ON f.id = s."folderId"
        LEFT JOIN "Category" c ON c.id = s."categoryId"
        WHERE ${commonWhere}
          AND ${searchWhere}
      `;

      const ids = idsResult.map((r) => r.id);
      total = countResult.length ? Number(countResult[0].count) : 0;

      if (ids.length > 0) {
        stills = await prisma.still.findMany({
          where: { id: { in: ids } },
          orderBy: { createdAt: "desc" },
          include: {
            folder: { select: { id: true, name: true } },
            category: { select: { id: true, name: true } },
            tags: { include: { tag: { select: { id: true, name: true } } } },
            colours: {
              select: { id: true, hex: true, name: true, population: true },
              orderBy: { population: "desc" as const },
              take: 6,
            },
          },
        });
      } else {
        stills = [];
      }
    } else {
      const result = await Promise.all([
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
              orderBy: { population: "desc" as const },
              take: 6,
            },
          },
        }),
        prisma.still.count({ where }),
      ]);

      stills = result[0];
      total = result[1];
    }

    return NextResponse.json({
      data: stills,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("[GET /api/search]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
