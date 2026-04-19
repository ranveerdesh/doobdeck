import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { searchSchema, stillSchema } from "@/lib/validations";

const STILL_INCLUDE = {
  folder: { select: { id: true, name: true } },
  category: { select: { id: true, name: true } },
  tags: { include: { tag: { select: { id: true, name: true } } } },
  colours: {
    select: { id: true, hex: true, name: true, population: true },
    orderBy: { population: "desc" as const },
    take: 6,
  },
};

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
        include: STILL_INCLUDE,
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
    console.error("[GET /api/stills]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const body = await request.json();
    const parsed = stillSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { tags, folderId, categoryId, ...rest } = parsed.data;

    // Validate folder/category ownership
    if (folderId) {
      const folder = await prisma.folder.findUnique({ where: { id: folderId } });
      if (!folder || folder.userId !== userId) {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 });
      }
    }
    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: categoryId } });
      if (!category || category.userId !== userId) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
    }

    // Upsert tags
    const tagRecords = await Promise.all(
      (tags ?? []).map((name) =>
        prisma.tag.upsert({
          where: { userId_name: { userId, name } },
          create: { name, userId },
          update: {},
        })
      )
    );

    const still = await prisma.still.create({
      data: {
        ...rest,
        userId,
        folderId: folderId ?? null,
        categoryId: categoryId ?? null,
        imageUrl: (body as { imageUrl: string }).imageUrl,
        imagePublicId: (body as { imagePublicId: string }).imagePublicId,
        tags: {
          create: tagRecords.map((tag) => ({ tagId: tag.id })),
        },
      },
      include: STILL_INCLUDE,
    });

    return NextResponse.json({ data: still }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/stills]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
