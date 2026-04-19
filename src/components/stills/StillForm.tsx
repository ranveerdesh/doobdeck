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
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Title *"
        {...register("title")}
        error={errors.title?.message}
        placeholder="e.g. Rooftop at dusk"
      />

      <div className="grid grid-cols-2 gap-4">
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

      <div className="grid grid-cols-2 gap-4">
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
          <label className="text-sm font-medium text-text-secondary">
            Folder
          </label>
          <Controller
            name="folderId"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                value={field.value ?? ""}
                className="h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
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
        <label className="text-sm font-medium text-text-secondary">
          Category
        </label>
        <Controller
          name="categoryId"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              value={field.value ?? ""}
              className="h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
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
        <label className="text-sm font-medium text-text-secondary">Tags</label>
        <div className="flex flex-wrap gap-1.5 min-h-[40px] rounded-md border border-border bg-surface px-3 py-2">
          {currentTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-accent-subtle text-accent text-xs px-2 py-0.5 border border-accent/20"
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
            className="flex-1 min-w-[120px] bg-transparent text-sm text-text-primary outline-none placeholder:text-text-disabled"
          />
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            <span className="text-xs text-text-muted">Existing:</span>
            {allTags
              .filter((t) => !currentTags.includes(t.name))
              .slice(0, 15)
              .map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => addTag(tag.name)}
                  className="text-xs text-text-muted hover:text-accent transition-colors"
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
