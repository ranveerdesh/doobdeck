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
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.32em] text-text-muted">
          categories
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          Classify your stills by genre, mood or theme.
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
          Use categories to keep your archive readable at a glance.
        </p>
      </section>
      <CategoryList categories={categories} />
    </div>
  );
}
