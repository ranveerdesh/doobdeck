import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
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
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" as const } },
              { description: { contains: q, mode: "insensitive" as const } },
              { filmName: { contains: q, mode: "insensitive" as const } },
              { director: { contains: q, mode: "insensitive" as const } },
              { notes: { contains: q, mode: "insensitive" as const } },
              {
                folder: { name: { contains: q, mode: "insensitive" as const } },
              },
              {
                category: {
                  name: { contains: q, mode: "insensitive" as const },
                },
              },
              {
                tags: {
                  some: {
                    tag: {
                      name: { contains: q, mode: "insensitive" as const },
                    },
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
            orderBy: { population: "desc" as const },
            take: 6,
          },
        },
      }),
      prisma.still.count({ where }),
    ]);

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
