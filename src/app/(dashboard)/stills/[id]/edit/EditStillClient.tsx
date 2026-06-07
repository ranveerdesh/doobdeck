"use client";

import { useRouter } from "next/navigation";
import { StillForm } from "@/components/stills/StillForm";
import type { StillInput } from "@/lib/validations";
import type { Folder, Category, Tag, Still } from "@prisma/client";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

interface EditStillClientProps {
  still: Still & { tags: Array<{ tag: Tag }> };
  folders: Folder[];
  categories: Category[];
  tags: Tag[];
}

export default function EditStillClient({
  still,
  folders,
  categories,
  tags,
}: EditStillClientProps) {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleSubmit = async (data: StillInput) => {
    setError("");
    const res = await fetch(`/api/stills/${still.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error ?? "Failed to save changes");
      return;
    }

    router.push(`/stills/${still.id}`);
    router.refresh();
  };

  return (
    <div className="max-w-2xl space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-danger/20 bg-danger-subtle px-3 py-3 text-sm text-danger">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
      <StillForm
        mode="edit"
        defaultValues={{
          title: still.title,
          description: still.description ?? "",
          filmName: still.filmName ?? "",
          director: still.director ?? "",
          cinematographer: still.cinematographer ?? "",
          editor: still.editor ?? "",
          actor: still.actor ?? "",
          year: still.year ?? undefined,
          notes: still.notes ?? "",
          shotType: still.shotType ?? "",
          aspectRatio: still.aspectRatio ?? "",
          frameSize: still.frameSize ?? "",
          composition: still.composition ?? "",
          lighting: still.lighting ?? "",
          interiorExterior: (still.interiorExterior as any) ?? undefined,
          timeOfDay: (still.timeOfDay as any) ?? undefined,
          lensSize: (still.lensSize as any) ?? undefined,
          set: still.set ?? "",
          colourTags: still.colourTags ?? [],
          folderId: still.folderId ?? undefined,
          categoryId: still.categoryId ?? undefined,
          tags: still.tags.map((t) => t.tag.name),
        }}
        folders={folders}
        categories={categories}
        allTags={tags}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
      />
    </div>
  );
}
