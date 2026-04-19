import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditStillClient from "./EditStillClient";
import type { Metadata } from "next";

interface EditStillPageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Edit Still" };

export default async function EditStillPage({ params }: EditStillPageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const userId = session.user.id;
  const { id } = await params;

  const [still, folders, categories, tags] = await Promise.all([
    prisma.still.findUnique({
      where: { id },
      include: { tags: { include: { tag: true } } },
    }),
    prisma.folder.findMany({ where: { userId }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { userId }, orderBy: { name: "asc" } }),
    prisma.tag.findMany({ where: { userId }, orderBy: { name: "asc" } }),
  ]);

  if (!still || still.userId !== userId) notFound();

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="space-y-1">
        <Link
          href={`/stills/${still.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          Back to still
        </Link>
        <h1 className="text-2xl font-bold text-text-primary">Edit Still</h1>
      </div>
      <EditStillClient
        still={still}
        folders={folders}
        categories={categories}
        tags={tags}
      />
    </div>
  );
}
