import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { folderSchema } from "@/lib/validations";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const folders = await prisma.folder.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
      include: { _count: { select: { stills: true } } },
    });

    return NextResponse.json({ data: folders });
  } catch (error) {
    console.error("[GET /api/folders]", error);
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
    const parsed = folderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const folder = await prisma.folder.create({
      data: { name: parsed.data.name, userId },
      include: { _count: { select: { stills: true } } },
    });

    return NextResponse.json({ data: folder }, { status: 201 });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return NextResponse.json(
        { error: "A folder with that name already exists" },
        { status: 409 }
      );
    }
    console.error("[POST /api/folders]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
