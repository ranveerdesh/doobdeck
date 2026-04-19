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
      if (data.filmName) formData.append("filmName", data.filmName);
      if (data.director) formData.append("director", data.director);
      if (data.year != null) formData.append("year", String(data.year));
      if (data.description) formData.append("description", data.description);
      if (data.notes) formData.append("notes", data.notes);
      if (data.folderId) formData.append("folderId", data.folderId);
      if (data.categoryId) formData.append("categoryId", data.categoryId);
      if (data.tags?.length) {
        formData.append("tags", JSON.stringify(data.tags));
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
      <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
        <div className="p-3 rounded-full bg-success/10">
          <CheckCircle2 size={28} className="text-success" />
        </div>
        <p className="text-text-primary font-medium">Still uploaded!</p>
        <p className="text-sm text-text-muted">Redirecting…</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-danger-subtle border border-danger/20 text-sm text-danger">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-text-secondary">
          Image *
        </label>
        <UploadZone
          onFile={handleFile}
          preview={preview}
          disabled={uploading}
        />
      </div>

      <StillForm
        folders={folders}
        categories={categories}
        allTags={tags}
        onSubmit={handleSubmit}
        submitLabel={uploading ? "Uploading…" : "Upload Still"}
      />
    </div>
  );
}
