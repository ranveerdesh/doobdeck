import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: { id: string };
}

export async function GET(_req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const still = await prisma.still.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!still || still.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const colours = await prisma.colour.findMany({
      where: { stillId: params.id },
      orderBy: { population: "desc" },
    });

    return NextResponse.json({ data: colours });
  } catch (error) {
    console.error("[GET /api/stills/[id]/colours]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
