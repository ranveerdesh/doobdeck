"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UploadZone } from "@/components/stills/UploadZone";
import { StillForm } from "@/components/stills/StillForm";
import { uploadSchema, type UploadInput } from "@/lib/validations";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { Folder, Category, Tag } from "@prisma/client";
import type { UploadInput } from "@/lib/validations";

interface UploadFormData extends UploadInput {
  file?: File;
}

export default function UploadPageClient({
  folders,
  categories,
  tags,
}: {
  folders: Folder[];
  categories: Category[];
  tags: Tag[];
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }, []);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleSubmit = async (data: UploadInput) => {
    if (!file) {
      setError("Please select an image to upload.");
      return;
    }
    setError("");
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", data.title);
      formData.append("filmName", data.filmName);
      if (data.director) formData.append("director", data.director);
      if (data.cinematographer) formData.append("cinematographer", data.cinematographer);
      if (data.editor) formData.append("editor", data.editor);
      if (data.actor) formData.append("actor", data.actor);
      if (data.year != null) formData.append("year", String(data.year));
      if (data.description) formData.append("description", data.description);
      if (data.notes) formData.append("notes", data.notes);
      if (data.shotType) formData.append("shotType", data.shotType);
      if (data.aspectRatio) formData.append("aspectRatio", data.aspectRatio);
      if (data.frameSize) formData.append("frameSize", data.frameSize);
      if (data.composition) formData.append("composition", data.composition);
      if (data.lighting) formData.append("lighting", data.lighting);
      if (data.interiorExterior) formData.append("interiorExterior", data.interiorExterior);
      if (data.timeOfDay) formData.append("timeOfDay", data.timeOfDay);
      if (data.lensSize) formData.append("lensSize", data.lensSize);
      if (data.set) formData.append("set", data.set);
      if (data.folderId) formData.append("folderId", data.folderId);
      if (data.categoryId) formData.append("categoryId", data.categoryId);
      if (data.tags?.length) {
        formData.append("tags", JSON.stringify(data.tags));
      }
      if (data.colourTags?.length) {
        formData.append("colourTags", JSON.stringify(data.colourTags));
      }

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const json = await res.json();
        setError(json.error ?? "Upload failed. Please try again.");
        return;
      }

      const json = await res.json();
      setSuccess(true);
      setTimeout(() => {
        router.push(`/stills/${json.data.id}`);
        router.refresh();
      }, 800);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-md border border-border/80 bg-surface-container-low/60 py-20 text-center">
        <div className="rounded-md border border-success/20 bg-success-subtle p-3">
          <CheckCircle2 size={28} className="text-success" />
        </div>
        <p className="font-medium text-text-primary">Still uploaded!</p>
        <p className="text-sm text-text-muted">Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-md border border-danger/20 bg-danger-subtle px-3 py-3 text-sm text-danger">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <div className="space-y-2 rounded-md border border-border/80 bg-surface-container-low/60 p-4">
        <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
          Image *
        </label>
        <UploadZone
          onFile={handleFile}
          preview={preview}
          disabled={uploading}
        />
      </div>

      <StillForm
        mode="create"
        folders={folders}
        categories={categories}
        allTags={tags}
        onSubmit={handleSubmit}
        submitLabel={uploading ? "Uploading…" : "Upload Still"}
      />
    </div>
  );
}
