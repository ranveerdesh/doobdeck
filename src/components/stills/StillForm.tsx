"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stillSchema, type StillInput } from "@/lib/validations";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Folder, Category, Tag } from "@prisma/client";
import { useState } from "react";
import { X } from "lucide-react";

interface StillFormProps {
  defaultValues?: Partial<StillInput>;
  folders: Folder[];
  categories: Category[];
  allTags: Tag[];
  onSubmit: (data: StillInput) => Promise<void>;
  submitLabel?: string;
}

function StillForm({
  defaultValues,
  folders,
  categories,
  allTags,
  onSubmit,
  submitLabel = "Save",
}: StillFormProps) {
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<StillInput>({
    resolver: zodResolver(stillSchema),
    defaultValues: {
      tags: [],
      ...defaultValues,
    },
  });

  const currentTags = watch("tags") ?? [];

  const addTag = (name: string) => {
    const trimmed = name.trim().toLowerCase();
    if (trimmed && !currentTags.includes(trimmed)) {
      setValue("tags", [...currentTags, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setValue(
      "tags",
      currentTags.filter((t) => t !== tag)
    );
  };

  const handleFormSubmit = async (data: StillInput) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 rounded-md border border-border/80 bg-surface-container-low/60 p-5 shadow-card sm:p-6">
      <Input
        label="Title *"
        {...register("title")}
        error={errors.title?.message}
        placeholder="e.g. Rooftop at dusk"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Film Name"
          {...register("filmName")}
          error={errors.filmName?.message}
          placeholder="e.g. Blade Runner"
        />
        <Input
          label="Director"
          {...register("director")}
          error={errors.director?.message}
          placeholder="e.g. Ridley Scott"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="Year"
          type="number"
          {...register("year", {
            setValueAs: (v) => (v === "" ? null : parseInt(v, 10)),
          })}
          error={errors.year?.message}
          placeholder="e.g. 1982"
        />

        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
            Folder
          </label>
          <Controller
            name="folderId"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                value={field.value ?? ""}
                className="h-11 w-full rounded-md border border-border/80 bg-surface-container-low/80 px-3 py-2 text-sm text-text-primary focus:border-accent/70 focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <option value="">No folder</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
          Category
        </label>
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              value={field.value ?? ""}
              className="h-11 w-full rounded-md border border-border/80 bg-surface-container-low/80 px-3 py-2 text-sm text-text-primary focus:border-accent/70 focus:outline-none focus:ring-2 focus:ring-accent/30"
            >
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        />
      </div>

      <Textarea
        label="Description"
        {...register("description")}
        error={errors.description?.message}
        placeholder="Optional description of the still..."
        rows={3}
      />

      <Textarea
        label="Notes"
        {...register("notes")}
        error={errors.notes?.message}
        placeholder="Personal notes about this still..."
        rows={3}
      />

      {/* Tags */}
      <div className="flex flex-col gap-1.5">
        <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">Tags</label>
        <div className="flex min-h-[48px] flex-wrap gap-1.5 rounded-md border border-border/80 bg-surface-container-low/80 px-3 py-2.5">
          {currentTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-md border border-accent/20 bg-accent-subtle px-2 py-0.5 text-xs text-accent"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-accent-dim"
              >
                <X size={10} />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag(tagInput);
              }
            }}
            placeholder={currentTags.length === 0 ? "Add tags... (Enter to add)" : ""}
            className="min-w-[120px] flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
          />
        </div>
        {allTags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            <span className="text-xs text-text-muted">Existing:</span>
            {allTags
              .filter((t) => !currentTags.includes(t.name))
              .slice(0, 15)
              .map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => addTag(tag.name)}
                  className="text-xs text-text-muted transition-colors hover:text-accent"
                >
                  {tag.name}
                </button>
              ))}
          </div>
        )}
      </div>

      <div className="pt-2">
        <Button type="submit" loading={isSubmitting} className="w-full">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export { StillForm };
