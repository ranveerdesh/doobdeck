import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stillSchema } from "@/lib/validations";
import { cloudinary } from "@/lib/cloudinary";

const STILL_INCLUDE = {
  folder: { select: { id: true, name: true } },
  category: { select: { id: true, name: true } },
  tags: { include: { tag: { select: { id: true, name: true } } } },
  colours: {
    select: { id: true, hex: true, name: true, population: true },
    orderBy: { population: "desc" as const },
  },
};

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const still = await prisma.still.findFirst({
      where: { id, userId: session.user.id },
      include: STILL_INCLUDE,
    });

    if (!still) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ data: still });
  } catch (error) {
    console.error("[GET /api/stills/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const { id } = await params;
    const existing = await prisma.still.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existing || existing.userId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = stillSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { tags, folderId, categoryId, ...rest } = parsed.data;

    // Validate folder/category ownership in parallel
    if (folderId || categoryId) {
      const [folder, category] = await Promise.all([
        folderId
          ? prisma.folder.findFirst({ where: { id: folderId, userId }, select: { id: true } })
          : null,
        categoryId
          ? prisma.category.findFirst({ where: { id: categoryId, userId }, select: { id: true } })
          : null,
      ]);
      if (folderId && !folder) {
        return NextResponse.json({ error: "Folder not found" }, { status: 404 });
      }
      if (categoryId && !category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
    }

    // Insert new tags in one statement, then fetch all by name
    const tagNames = tags ?? [];
    if (tagNames.length > 0) {
      await prisma.tag.createMany({
        data: tagNames.map((name) => ({ name, userId })),
        skipDuplicates: true,
      });
    }
    const tagRecords = tagNames.length > 0
      ? await prisma.tag.findMany({
          where: { userId, name: { in: tagNames } },
          select: { id: true },
        })
      : [];

    // Update still with new tags
    const still = await prisma.still.update({
      where: { id },
      data: {
        ...rest,
        folderId: folderId ?? null,
        categoryId: categoryId ?? null,
        tags: {
          deleteMany: {},
          create: tagRecords.map((tag) => ({ tagId: tag.id })),
        },
      },
      include: STILL_INCLUDE,
    });

    return NextResponse.json({ data: still });
  } catch (error) {
    console.error("[PATCH /api/stills/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const still = await prisma.still.findUnique({
      where: { id },
      select: { userId: true, imagePublicId: true },
    });

    if (!still || still.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(still.imagePublicId);
    } catch (cloudErr) {
      console.error("Cloudinary delete failed:", cloudErr);
      // Continue with DB deletion even if Cloudinary fails
    }

    await prisma.still.delete({ where: { id } });

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error("[DELETE /api/stills/[id]]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
