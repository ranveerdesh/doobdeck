"use client";

import { useCallback, useState } from "react";
import { UploadCloud, FileImage, AlertCircle } from "lucide-react";
import { cn } from "@/lib/cn";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface UploadZoneProps {
  onFile: (file: File) => void;
  preview?: string | null;
  disabled?: boolean;
  className?: string;
}

function UploadZone({ onFile, preview, disabled, className }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndSet = useCallback(
    (file: File) => {
      setError(null);
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Only JPEG, PNG, WebP and GIF images are accepted.");
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setError(`Image must be smaller than ${MAX_SIZE_MB}MB.`);
        return;
      }
      onFile(file);
    },
    [onFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) validateAndSet(file);
    },
    [validateAndSet]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) validateAndSet(file);
    },
    [validateAndSet]
  );

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={disabled ? undefined : handleDrop}
        className={cn(
          "relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed",
          "min-h-[200px] cursor-pointer transition-all duration-200",
          isDragging
            ? "border-accent bg-accent-subtle"
            : "border-border hover:border-border-strong hover:bg-surface-raised",
          disabled && "opacity-50 cursor-not-allowed",
          preview ? "aspect-video" : ""
        )}
      >
        <input
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          aria-label="Upload image"
        />

        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-center px-6 py-8">
            <div
              className={cn(
                "rounded-full p-3",
                isDragging ? "bg-accent/20" : "bg-surface-raised"
              )}
            >
              <UploadCloud
                size={28}
                className={isDragging ? "text-accent" : "text-text-muted"}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">
                {isDragging ? "Drop to upload" : "Drop image here or click to browse"}
              </p>
              <p className="text-xs text-text-muted mt-1">
                JPEG, PNG, WebP, GIF — max {MAX_SIZE_MB}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {preview && (
        <p className="flex items-center gap-1.5 text-xs text-success">
          <FileImage size={12} />
          Image selected — click to change
        </p>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-danger">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
}

export { UploadZone };
