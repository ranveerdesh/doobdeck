import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { StillGrid } from "@/components/stills/StillGrid";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface CategoryDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: CategoryDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id }, select: { name: true } });

  return {
    title: category ? `${category.name} · Category` : "Category",
  };
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const userId = session.user.id;
  const { id } = await params;

  const category = await prisma.category.findFirst({
    where: { id, userId },
    include: {
      stills: {
        orderBy: { createdAt: "desc" },
        include: {
          folder: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
          tags: { include: { tag: { select: { id: true, name: true } } } },
          colours: {
            select: { id: true, hex: true, name: true, population: true },
            orderBy: { population: "desc" },
            take: 6,
          },
        },
      },
    },
  });

  if (!category) notFound();

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-[11px] uppercase tracking-[0.18em] text-text-muted transition-colors hover:bg-white/[0.03] hover:text-text-primary"
        >
          <ArrowLeft size={14} />
          Back to categories
        </Link>

        <p className="font-mono text-xs uppercase tracking-[0.32em] text-text-muted">
          Category
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          {category.name}
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
          {category.stills.length} still{category.stills.length !== 1 ? "s" : ""} inside this category.
        </p>
      </section>

      <StillGrid
        stills={category.stills}
        emptyMessage="No stills in this category yet. Upload a still and assign it here."
      />
    </div>
  );
}