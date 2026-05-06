import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { FolderList } from "@/components/folders/FolderList";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Folders" };

export default async function FoldersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/sign-in");

  const folders = await prisma.folder.findMany({
    where: { userId: session.user.id },
    orderBy: { name: "asc" },
    include: { _count: { select: { stills: true } } },
  });

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <p className="font-mono text-xs uppercase tracking-[0.32em] text-text-muted">
          folders
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
          Organise your stills into folders.
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
          Group related frames into named sets so the collection stays structured.
        </p>
      </section>
      <FolderList folders={folders} />
    </div>
  );
}
