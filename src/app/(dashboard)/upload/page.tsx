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
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Upload Still</h1>
        <p className="text-sm text-text-muted mt-1">
          Add a new film still to your collection.
        </p>
      </div>
      <UploadPageClient folders={folders} categories={categories} tags={tags} />
    </div>
  );
}
