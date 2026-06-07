import { z } from "zod";
import { isValidInviteCode, normalizeInviteCode } from "./invite-codes";

export const INTERIOR_EXTERIOR_OPTIONS = ["Interior", "Exterior", "I/E"] as const;
export const TIME_OF_DAY_OPTIONS = [
  "Dawn",
  "Morning",
  "Midday",
  "Afternoon",
  "Golden Hour",
  "Sunset",
  "Twilight",
  "Night",
  "Blue Hour",
] as const;
export const LENS_SIZE_OPTIONS = [
  "Ultra Wide",
  "Wide",
  "Medium Wide",
  "Standard",
  "Short Telephoto",
  "Telephoto",
  "Macro",
  "Anamorphic",
] as const;

const optionalSelectSchema = <T extends readonly [string, ...string[]]>(
  values: T
) =>
  z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.enum(values).optional()
  );

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72),
  inviteCode: z
    .string()
    .min(1, "Invite code is required")
    .refine(
      (code) => !code.includes(" "),
      "Invite code cannot contain spaces"
    )
    .refine(
      (code) => isValidInviteCode(normalizeInviteCode(code)),
      "Invalid invite code"
    ),
});

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const stillMetadataSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional().or(z.literal("")),
  filmName: z.string().max(200).optional().or(z.literal("")),
  director: z.string().max(200).optional().or(z.literal("")),
  cinematographer: z.string().max(200).optional().or(z.literal("")),
  editor: z.string().max(200).optional().or(z.literal("")),
  actor: z.string().max(200).optional().or(z.literal("")),
  year: z
    .number()
    .int()
    .min(1888, "Year must be 1888 or later")
    // Allow up to 5 years in the future to accommodate pre-production announcements
    .max(new Date().getFullYear() + 5)
    .optional()
    .nullable(),
  notes: z.string().max(5000).optional().or(z.literal("")),
  shotType: z.string().max(120).optional().or(z.literal("")),
  aspectRatio: z.string().max(50).optional().or(z.literal("")),
  frameSize: z.string().max(50).optional().or(z.literal("")),
  composition: z.string().max(120).optional().or(z.literal("")),
  lighting: z.string().max(120).optional().or(z.literal("")),
  interiorExterior: optionalSelectSchema(INTERIOR_EXTERIOR_OPTIONS),
  timeOfDay: optionalSelectSchema(TIME_OF_DAY_OPTIONS),
  lensSize: optionalSelectSchema(LENS_SIZE_OPTIONS),
  set: z.string().max(120).optional().or(z.literal("")),
  colourTags: z.array(z.string().min(1).max(60)).max(10).optional().default([]),
  folderId: z.string().cuid().optional().nullable(),
  categoryId: z.string().cuid().optional().nullable(),
  tags: z.array(z.string().min(1).max(50)).max(20).optional(),
});

export const stillSchema = stillMetadataSchema;

export const folderSchema = z.object({
  name: z
    .string()
    .min(1, "Folder name is required")
    .max(100)
    .regex(/^[^/\\]+$/, "Folder name cannot contain / or \\")
});

export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100),
});

export const uploadSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  filmName: z.string().min(1, "Film name is required").max(200),
  director: z.string().max(200).optional().or(z.literal("")),
  cinematographer: z.string().max(200).optional().or(z.literal("")),
  editor: z.string().max(200).optional().or(z.literal("")),
  actor: z.string().max(200).optional().or(z.literal("")),
  year: z
    .number()
    .int()
    .min(1888)
    .max(new Date().getFullYear() + 5)
    .optional()
    .nullable(),
  description: z.string().max(2000).optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
  shotType: z.string().max(120).optional().or(z.literal("")),
  aspectRatio: z.string().max(50).optional().or(z.literal("")),
  frameSize: z.string().max(50).optional().or(z.literal("")),
  composition: z.string().max(120).optional().or(z.literal("")),
  lighting: z.string().max(120).optional().or(z.literal("")),
  interiorExterior: z.enum(INTERIOR_EXTERIOR_OPTIONS),
  timeOfDay: z.enum(TIME_OF_DAY_OPTIONS),
  lensSize: z.enum(LENS_SIZE_OPTIONS),
  set: z.string().max(120).optional().or(z.literal("")),
  colourTags: z.array(z.string().min(1).max(60)).max(10).optional().default([]),
  folderId: z.string().cuid({ message: "Folder is required" }),
  categoryId: z.string().cuid({ message: "Category is required" }),
  tags: z.array(z.string().min(1).max(50)).max(20).optional(),
});

export const searchSchema = z.object({
  q: z.string().max(200).optional(),
  folderId: z.string().cuid().optional(),
  categoryId: z.string().cuid().optional(),
  tag: z.string().max(50).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(24),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type StillInput = z.infer<typeof stillSchema>;
export type FolderInput = z.infer<typeof folderSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type UploadInput = z.infer<typeof uploadSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
