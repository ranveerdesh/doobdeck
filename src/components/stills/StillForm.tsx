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

// No collapsible section — render metadata fields directly (no "Metadata" header)

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
      <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">{label}{required ? " *" : ""}</label>
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
          <option key={option} value={option}>{option}</option>
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
      <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">{label}</label>
      <div className="flex min-h-[48px] flex-wrap gap-1.5 rounded-md border border-border/80 bg-surface-container-low/80 px-3 py-2.5">
        {values.map((value) => (
          <span key={value} className="inline-flex items-center gap-1 rounded-md border border-accent/20 bg-accent-subtle px-2 py-0.5 text-xs text-accent">
            {value}
            <button type="button" onClick={() => onRemove(value)} className="hover:text-accent-dim"><X size={10} /></button>
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
    resolver: zodResolver(schema as any),
    defaultValues: {
      tags: [],
      colourTags: [],
      ...defaultValues,
    } as DefaultValues<TValues>,
  });

  const watchAny = watch as unknown as (...args: any[]) => any;
  const currentTags: string[] = watchAny("tags") ?? [];
  const currentColours: string[] = watchAny("colourTags") ?? [];

  // helper to avoid type-assertions inside JSX spreads (SWC parser can choke on `as` in JSX)
  const registerAny = register as unknown as (...args: any[]) => any;
  const setValueAny = setValue as unknown as (name: string, value: any) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ControllerAny = Controller as any;

  const addTag = (name: string) => {
    const trimmed = name.trim().toLowerCase();
    if (trimmed && !currentTags.includes(trimmed)) {
      setValueAny("tags", [...currentTags, trimmed]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setValueAny("tags", currentTags.filter((t) => t !== tag));
  };

  const addColour = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !currentColours.includes(trimmed)) {
      setValueAny("colourTags", [...currentColours, trimmed]);
    }
  };

  const removeColour = (value: string) => {
    setValueAny("colourTags", currentColours.filter((item) => item !== value));
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
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <Input label="Title *" {...registerAny("title")} error={errors.title?.message} placeholder="e.g. Rooftop at dusk" />

          <Input label="Film Name *" {...registerAny("filmName")} error={errors.filmName?.message} placeholder="e.g. Blade Runner" />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">Folder *</label>
              <ControllerAny name="folderId" control={control} render={({ field }: any) => (
                <select {...field} value={field.value ?? ""} className="h-11 w-full rounded-md border border-border/80 bg-surface-container-low/80 px-3 py-2 text-sm text-text-primary focus:border-accent/70 focus:outline-none focus:ring-2 focus:ring-accent/30">
                  <option value="">No deck</option>
                  {folders.map((folder) => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              )} />
              {errors.folderId && <p className="text-xs text-danger">{(errors.folderId as any).message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-muted">Category *</label>
              <ControllerAny name="categoryId" control={control} render={({ field }: any) => (
                <select {...field} value={field.value ?? ""} className="h-11 w-full rounded-md border border-border/80 bg-surface-container-low/80 px-3 py-2 text-sm text-text-primary focus:border-accent/70 focus:outline-none focus:ring-2 focus:ring-accent/30">
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              )} />
              {errors.categoryId && <p className="text-xs text-danger">{(errors.categoryId as any).message}</p>}
            </div>
          </div>

          <Input label="Year" type="number" {...registerAny("year", { setValueAs: (value: string) => (value === "" ? null : parseInt(value, 10)) })} error={errors.year?.message} placeholder="e.g. 1982" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Director" {...registerAny("director")} error={errors.director?.message} placeholder="e.g. Ridley Scott" />
          <Input label="Cinematographer" {...registerAny("cinematographer")} error={errors.cinematographer?.message} placeholder="e.g. Jordan Cronenweth" />
          <Input label="Editor" {...registerAny("editor")} error={errors.editor?.message} placeholder="e.g. Terry Rawlings" />
          <Input label="Actor" {...registerAny("actor")} error={errors.actor?.message} placeholder="e.g. Harrison Ford" />
        </div>

        <Textarea label="Description" {...registerAny("description")} error={errors.description?.message} placeholder="Optional description..." rows={3} />
        <Textarea label="Other Notes" {...registerAny("notes")} error={errors.notes?.message} placeholder="Personal notes..." rows={3} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Shot Type" {...registerAny("shotType")} error={errors.shotType?.message} placeholder="e.g. Close-Up" />
          <Input label="Composition" {...registerAny("composition")} error={errors.composition?.message} placeholder="e.g. Rule of Thirds" />
          <Input label="Lighting" {...registerAny("lighting")} error={errors.lighting?.message} placeholder="e.g. Soft Backlight" />
          <Input label="Set" {...registerAny("set")} error={errors.set?.message} placeholder="e.g. Apartment interior" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ControllerAny name="interiorExterior" control={control} render={({ field }: any) => (
            <SelectField label="Interior / Exterior" value={field.value ?? ""} onChange={field.onChange} options={INTERIOR_EXTERIOR_OPTIONS} placeholder="Select interior / exterior" required={isCreate} />
          )} />
          <ControllerAny name="timeOfDay" control={control} render={({ field }: any) => (
            <SelectField label="Time of Day" value={field.value ?? ""} onChange={field.onChange} options={TIME_OF_DAY_OPTIONS} placeholder="Select time of day" required={isCreate} />
          )} />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label="Aspect Ratio" {...registerAny("aspectRatio")} error={errors.aspectRatio?.message} placeholder="e.g. 2.39:1" />
          <Input label="Frame Size" {...registerAny("frameSize")} error={errors.frameSize?.message} placeholder="e.g. 4K" />
          <ControllerAny name="lensSize" control={control} render={({ field }: any) => (
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
              {allTags
                .filter((tag) => !currentTags.includes(tag.name))
                .slice(0, 15)
                .map((tag) => (
                  <button key={tag.id} type="button" onClick={() => addTag(tag.name)} className="text-xs text-text-muted transition-colors hover:text-accent">{tag.name}</button>
                ))}
            </div>
          )}
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" loading={isSubmitting} className="w-full">{submitLabel}</Button>
      </div>
    </form>
  );
}

export { StillForm };

export default StillForm;
