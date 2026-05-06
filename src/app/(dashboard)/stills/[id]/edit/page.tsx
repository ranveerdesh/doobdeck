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
    <div className="space-y-6">
      <div className="space-y-3">
        <Link
          href={`/stills/${still.id}`}
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-text-muted transition-colors hover:text-text-primary"
        >
          <ArrowLeft size={14} />
          Back to still
        </Link>
        <p className="font-mono text-xs uppercase tracking-[0.32em] text-text-muted">
          edit
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          Edit still
        </h1>
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
