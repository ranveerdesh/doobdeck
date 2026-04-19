import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tags = await prisma.tag.findMany({
      where: { userId: session.user.id },
      orderBy: { name: "asc" },
      include: { _count: { select: { stills: true } } },
    });

    return NextResponse.json({ data: tags });
  } catch (error) {
    console.error("[GET /api/tags]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
