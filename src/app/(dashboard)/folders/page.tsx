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
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Folders</h1>
        <p className="text-sm text-text-muted mt-1">
          Organise your stills into folders.
        </p>
      </div>
      <FolderList folders={folders} />
    </div>
  );
}
