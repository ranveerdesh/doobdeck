import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import UploadPageClient from "./UploadPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Upload" };

export default async function UploadPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const userId = session.user.id;

  const [folders, categories, tags] = await Promise.all([
    prisma.folder.findMany({ where: { userId }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ where: { userId }, orderBy: { name: "asc" } }),
    prisma.tag.findMany({ where: { userId }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.32em] text-text-muted">
          upload
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          Add a new film still to your collection.
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
          Drop in a frame, then annotate it with the metadata that makes it searchable later.
        </p>
      </section>
      <UploadPageClient folders={folders} categories={categories} tags={tags} />
    </div>
  );
}
