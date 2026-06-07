"use client";

import { useState } from "react";
import { Controller, type DefaultValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  INTERIOR_EXTERIOR_OPTIONS,
  LENS_SIZE_OPTIONS,
  TIME_OF_DAY_OPTIONS,
  stillSchema,
  uploadSchema,
  type StillInput,
  type UploadInput,
} from "@/lib/validations";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Folder, Category, Tag } from "@prisma/client";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

interface StillFormProps<TValues extends StillInput | UploadInput = StillInput> {
  defaultValues?: Partial<TValues>;
  folders: Folder[];
  categories: Category[];
  allTags: Tag[];
  onSubmit: (data: TValues) => Promise<void>;
  submitLabel?: string;
  mode?: "create" | "edit";
}

interface SectionProps {
  title: string;
  description: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function Section({ title, description, defaultOpen = false, children }: SectionProps) {
  return (
    <details open={defaultOpen} className="rounded-md border border-border/80 bg-surface-container-low/60 p-4 shadow-card sm:p-5">
      <summary className="cursor-pointer list-none">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-text-muted">
              {title}
            </p>
            <p className="mt-1 text-sm text-text-muted">{description}</p>
          </div>
          <span className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted">
            Details
          </span>
        </div>
      </summary>
      <div className="mt-4 border-t border-border/70 pt-4">{children}</div>
    </details>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  placeholder: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
        {label}{required ? " *" : ""}
      </label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-11 w-full rounded-md border border-border/80 bg-surface-container-low/80 px-3 py-2 text-sm text-text-primary",
          "focus:border-accent/70 focus:outline-none focus:ring-2 focus:ring-accent/30"
        )}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function ChipInput({
  label,
  values,
  onAdd,
  onRemove,
  placeholder,
}: {
  label: string;
  values: string[];
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
        {label}
      </label>
      <div className="flex min-h-[48px] flex-wrap gap-1.5 rounded-md border border-border/80 bg-surface-container-low/80 px-3 py-2.5">
        {values.map((value) => (
          <span
            key={value}
            className="inline-flex items-center gap-1 rounded-md border border-accent/20 bg-accent-subtle px-2 py-0.5 text-xs text-accent"
          >
            {value}
            <button
              type="button"
              onClick={() => onRemove(value)}
              className="hover:text-accent-dim"
            >
              <X size={10} />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              const trimmed = input.trim();
              if (trimmed) onAdd(trimmed);
              setInput("");
            }
          }}
          placeholder={values.length === 0 ? placeholder : ""}
          className="min-w-[120px] flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
        />
      </div>
    </div>
  );
}

function StillForm<TValues extends StillInput | UploadInput = StillInput>({
  defaultValues,
  folders,
  categories,
  allTags,
  onSubmit,
  submitLabel = "Save",
  mode = "edit",
}: StillFormProps<TValues>) {
  const [tagInput, setTagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema = mode === "create" ? uploadSchema : stillSchema;

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TValues>({
    resolver: zodResolver(schema as never),
    defaultValues: {
      tags: [],
      colourTags: [],
      ...defaultValues,
    } as DefaultValues<TValues>,
  });

  const currentTags = watch("tags") ?? [];
  const currentColours = watch("colourTags") ?? [];

  const addTag = (name: string) => {
    const trimmed = name.trim().toLowerCase();
    if (trimmed && !currentTags.includes(trimmed)) {
      setValue("tags", [...currentTags, trimmed] as never);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setValue(
      "tags",
      currentTags.filter((t) => t !== tag) as never
    );
  };

  const addColour = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !currentColours.includes(trimmed)) {
      setValue("colourTags", [...currentColours, trimmed] as never);
    }
  };

  const removeColour = (value: string) => {
    setValue(
      "colourTags",
      currentColours.filter((item) => item !== value) as never
    );
  };

  const handleFormSubmit = async (data: TValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCreate = mode === "create";

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 rounded-md border border-border/80 bg-surface-container-low/60 p-4 shadow-card sm:p-5">
      {isCreate ? (
        <Section title="Metadata" description="Required fields marked with * — provide additional information to improve searchability." defaultOpen>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Title *"
                {...register("title")}
                error={errors.title?.message}
                placeholder="e.g. Rooftop at dusk"
              />

              <Input
                label="Film Name *"
                {...register("filmName")}
                error={errors.filmName?.message}
                placeholder="e.g. Blade Runner"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">Folder *</label>
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
                        {folders.map((folder) => (
                          <option key={folder.id} value={folder.id}>
                            {folder.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.folderId && <p className="text-xs text-danger">{errors.folderId.message}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">Category *</label>
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
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.categoryId && <p className="text-xs text-danger">{errors.categoryId.message}</p>}
                </div>
              </div>

              <Input
                label="Year"
                type="number"
                {...register("year", {
                  setValueAs: (value) => (value === "" ? null : parseInt(value, 10)),
                })}
                error={errors.year?.message}
                placeholder="e.g. 1982"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Director" {...register("director")} error={errors.director?.message} placeholder="e.g. Ridley Scott" />
              <Input label="Cinematographer" {...register("cinematographer")} error={errors.cinematographer?.message} placeholder="e.g. Jordan Cronenweth" />
              <Input label="Editor" {...register("editor")} error={errors.editor?.message} placeholder="e.g. Terry Rawlings" />
              <Input label="Actor" {...register("actor")} error={errors.actor?.message} placeholder="e.g. Harrison Ford" />
            </div>

            <Textarea label="Description" {...register("description")} error={errors.description?.message} placeholder="Optional description..." rows={3} />
            <Textarea label="Other Notes" {...register("notes")} error={errors.notes?.message} placeholder="Personal notes..." rows={3} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input label="Shot Type" {...register("shotType")} error={errors.shotType?.message} placeholder="e.g. Close-Up" />
              <Input label="Composition" {...register("composition")} error={errors.composition?.message} placeholder="e.g. Rule of Thirds" />
              <Input label="Lighting" {...register("lighting")} error={errors.lighting?.message} placeholder="e.g. Soft Backlight" />
              <Input label="Set" {...register("set")} error={errors.set?.message} placeholder="e.g. Apartment interior" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller name="interiorExterior" control={control} render={({ field }) => (
                <SelectField label="Interior / Exterior" value={field.value ?? ""} onChange={field.onChange} options={INTERIOR_EXTERIOR_OPTIONS} placeholder="Select interior / exterior" required={isCreate} />
              )} />
              <Controller name="timeOfDay" control={control} render={({ field }) => (
                <SelectField label="Time of Day" value={field.value ?? ""} onChange={field.onChange} options={TIME_OF_DAY_OPTIONS} placeholder="Select time of day" required={isCreate} />
              )} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input label="Aspect Ratio" {...register("aspectRatio")} error={errors.aspectRatio?.message} placeholder="e.g. 2.39:1" />
              <Input label="Frame Size" {...register("frameSize")} error={errors.frameSize?.message} placeholder="e.g. 4K" />
              <Controller name="lensSize" control={control} render={({ field }) => (
                <SelectField label="Lens Size" value={field.value ?? ""} onChange={field.onChange} options={LENS_SIZE_OPTIONS} placeholder="Select lens size" required={isCreate} />
              )} />
            </div>

            <ChipInput label="Colour" values={currentColours} onAdd={addColour} onRemove={removeColour} placeholder="Add colour names..." />

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">Tags</label>
              <div className="flex min-h-[48px] flex-wrap gap-1.5 rounded-md border border-border/80 bg-surface-container-low/80 px-3 py-2.5">
                {currentTags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 rounded-md border border-accent/20 bg-accent-subtle px-2 py-0.5 text-xs text-accent">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-accent-dim"><X size={10} /></button>
                  </span>
                ))}
                <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagInput); } }} placeholder={currentTags.length === 0 ? "Add tags... (Enter to add)" : ""} className="min-w-[120px] flex-1 bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted" />
              </div>
              {allTags.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  <span className="text-xs text-text-muted">Existing:</span>
                  {allTags.filter((tag) => !currentTags.includes(tag.name)).slice(0, 15).map((tag) => (
                    <button key={tag.id} type="button" onClick={() => addTag(tag.name)} className="text-xs text-text-muted transition-colors hover:text-accent">{tag.name}</button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Section>
      ) : (
        <>
          <Section
            title="Core metadata"
            description="Required details that identify and file the still."
            defaultOpen
          >
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Title *"
                {...register("title")}
                error={errors.title?.message}
                placeholder="e.g. Rooftop at dusk"
              />

              <Input
                label={isCreate ? "Film Name *" : "Film Name"}
                {...register("filmName")}
                error={errors.filmName?.message}
                placeholder="e.g. Blade Runner"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
                    Folder{isCreate ? " *" : ""}
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
                        {folders.map((folder) => (
                          <option key={folder.id} value={folder.id}>
                            {folder.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.folderId && <p className="text-xs text-danger">{errors.folderId.message}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">
                    Category{isCreate ? " *" : ""}
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
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.categoryId && <p className="text-xs text-danger">{errors.categoryId.message}</p>}
                </div>
              </div>

              <Input
                label="Year"
                type="number"
                {...register("year", {
                  setValueAs: (value) => (value === "" ? null : parseInt(value, 10)),
                })}
                error={errors.year?.message}
                placeholder="e.g. 1982"
              />
            </div>
          </Section>

          <Section
            title="People & credits"
            description="Optional names associated with the shot."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Director"
                {...register("director")}
                error={errors.director?.message}
                placeholder="e.g. Ridley Scott"
              />
              <Input
                label="Cinematographer"
                {...register("cinematographer")}
                error={errors.cinematographer?.message}
                placeholder="e.g. Jordan Cronenweth"
              />
              <Input
                label="Editor"
                {...register("editor")}
                error={errors.editor?.message}
                placeholder="e.g. Terry Rawlings"
              />
              <Input
                label="Actor"
                {...register("actor")}
                error={errors.actor?.message}
                placeholder="e.g. Harrison Ford"
              />
            </div>
          </Section>

          <Section
            title="Creative metadata"
            description="Narrative and visual descriptors that help with discovery."
          >
            <div className="space-y-4">
              <Textarea
                label="Description"
                {...register("description")}
                error={errors.description?.message}
                placeholder="Optional description of the still..."
                rows={3}
              />

              <Textarea
                label="Other Notes"
                {...register("notes")}
                error={errors.notes?.message}
                placeholder="Personal notes about this still..."
                rows={3}
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Shot Type"
                  {...register("shotType")}
                  error={errors.shotType?.message}
                  placeholder="e.g. Close-Up"
                />
                <Input
                  label="Composition"
                  {...register("composition")}
                  error={errors.composition?.message}
                  placeholder="e.g. Rule of Thirds"
                />
                <Input
                  label="Lighting"
                  {...register("lighting")}
                  error={errors.lighting?.message}
                  placeholder="e.g. Soft Backlight"
                />
                <Input
                  label="Set"
                  {...register("set")}
                  error={errors.set?.message}
                  placeholder="e.g. Apartment interior"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Controller
                  name="interiorExterior"
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      label="Interior / Exterior"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={INTERIOR_EXTERIOR_OPTIONS}
                      placeholder="Select interior / exterior"
                      required={isCreate}
                    />
                  )}
                />
                <Controller
                  name="timeOfDay"
                  control={control}
                  render={({ field }) => (
                    <SelectField
                      label="Time of Day"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      options={TIME_OF_DAY_OPTIONS}
                      placeholder="Select time of day"
                      required={isCreate}
                    />
                  )}
                />
              </div>

              <ChipInput
                label="Colour"
                values={currentColours}
                onAdd={addColour}
                onRemove={removeColour}
                placeholder="Add colour names..."
              />
            </div>
          </Section>

          <Section
            title="Technical metadata"
            description="Descriptors for framing, capture, and presentation."
          >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                label="Aspect Ratio"
                {...register("aspectRatio")}
                error={errors.aspectRatio?.message}
                placeholder="e.g. 2.39:1"
              />
              <Input
                label="Frame Size"
                {...register("frameSize")}
                error={errors.frameSize?.message}
                placeholder="e.g. 4K"
              />
              <Controller
                name="lensSize"
                control={control}
                render={({ field }) => (
                  <SelectField
                    label="Lens Size"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    options={LENS_SIZE_OPTIONS}
                    placeholder="Select lens size"
                    required={isCreate}
                  />
                )}
              />
            </div>
          </Section>

          <div className="rounded-md border border-border/80 bg-surface-container-low/60 p-4 shadow-card">
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
                    .filter((tag) => !currentTags.includes(tag.name))
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
          </div>
        </>
      )}

      <div className="pt-2">
        <Button type="submit" loading={isSubmitting} className="w-full">
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

export { StillForm };
