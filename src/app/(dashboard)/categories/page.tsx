import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CategoryList } from "@/components/categories/CategoryList";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const categories = await prisma.category.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
    include: { _count: { select: { stills: true } } },
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Categories</h1>
        <p className="text-sm text-text-muted mt-1">
          Classify your stills by genre, mood or theme.
        </p>
      </div>
      <CategoryList categories={categories} />
    </div>
  );
}
