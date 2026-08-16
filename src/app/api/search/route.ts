import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { searchSchema } from "@/lib/validations";
import { searchStills } from "@/lib/search";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters = searchSchema.parse({
      q: searchParams.get("q") ?? undefined,
      folderId: searchParams.get("folderId") ?? undefined,
      categoryId: searchParams.get("categoryId") ?? undefined,
      tag: searchParams.get("tag") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const { stills, total } = await searchStills({
      userId: session.user.id,
      ...filters,
    });

    return NextResponse.json({
      data: stills,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
        hasMore: filters.page * filters.limit < total,
      },
    });
  } catch (error) {
    console.error("[GET /api/search]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
