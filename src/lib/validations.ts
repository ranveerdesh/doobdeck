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
  "Medium",
  "Short Telephoto",
  "Telephoto",
  "Macro",
  "Anamorphic",
] as const;
export const LENS_TYPE_OPTIONS = [
  "Spherical",
  "Anamorphic",
  "Macro",
  "Fisheye",
  "Tilt-Shift",
  "Probe",
  "Split Diopter",
] as const;
export const OPTICAL_FORMAT_OPTIONS = [
  "Medium/Large Format",
  "Open Gate",
  "Full Frame",
  "APS-H",
  "Super 35 / APS-C",
  "Micro Four Thirds",
  "Super 16 / 16mm",
  "Super 8 / 8mm",
] as const;
export const RESOLUTION_OPTIONS = [
  "8K: 7680 x 4320",
  "6K: 6144 x 3456",
  "4K DCI: 4096 x 2160",
  "4K UHD: 3840 x 2160",
  "2K DCI: 2048 x 1080",
  "1080p: 1920 x 1080",
  "720p: 1280 x 720",
  "480p: 854 x 480",
] as const;
export const SHOT_TYPE_OPTIONS = [
  "Aerial",
  "Overhead",
  "High Angle",
  "Low Angle",
  "Dutch Angle",
  "Establishing Shot",
  "Over the Shoulder",
  "Clean Single",
  "2 Shot",
  "3 Shot",
  "Group Shot",
  "Insert",
] as const;
export const ASPECT_RATIO_OPTIONS = [
  "9:16",
  "1:1",
  "1.20",
  "1.33",
  "1.37",
  "1.43",
  "1.66",
  "1.78",
  "1.85",
  "1.90",
  "2.00",
  "2.20",
  "2.35",
  "2.39",
  "2.55",
  "2.67",
  "2.76+",
] as const;
export const COMPOSITION_OPTIONS = [
  "Center",
  "Left Heavy",
  "Right Heavy",
  "Balanced",
  "Symmetrical",
  "Short Side",
] as const;
export const LIGHTING_OPTIONS = [
  "Soft Light",
  "Hard Light",
  "High Contrast",
  "Low Contrast",
  "Silhouette",
  "Top Light",
  "Underlight",
  "Side Light",
  "Backlight",
  "Edge Light",
] as const;
export const COLOUR_OPTIONS = [
  "Black & White",
  "Colour",
  "Desaturated",
  "Muted",
  "Vibrant",
  "Warm",
  "Cool",
  "High Contrast",
  "Low Contrast",
  "Bleach Bypass",
] as const;

const optionalSelectSchema = <T extends readonly [string, ...string[]]>(
  values: T
) =>
  z.preprocess(
    (value) => (value === "" ? undefined : value),
    z.enum(values).optional()
  );

const releaseDateSchema = z.preprocess(
  (v) => (v === "" || v === null ? undefined : v),
  z.coerce.date().optional().nullable()
);

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
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

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const stillMetadataSchema = z.object({
  title: z.string().max(200).optional().or(z.literal("")),
  description: z.string().max(2000).optional().or(z.literal("")),
  filmName: z.string().max(200).optional().or(z.literal("")),
  director: z.string().max(200).optional().or(z.literal("")),
  cinematographer: z.string().max(200).optional().or(z.literal("")),
  editor: z.string().max(200).optional().or(z.literal("")),
  actor: z.string().max(200).optional().or(z.literal("")),
  releaseDate: releaseDateSchema,
  notes: z.string().max(5000).optional().or(z.literal("")),
  shotType: optionalSelectSchema(SHOT_TYPE_OPTIONS),
  aspectRatio: optionalSelectSchema(ASPECT_RATIO_OPTIONS),
  resolution: optionalSelectSchema(RESOLUTION_OPTIONS),
  composition: optionalSelectSchema(COMPOSITION_OPTIONS),
  lighting: optionalSelectSchema(LIGHTING_OPTIONS),
  interiorExterior: optionalSelectSchema(INTERIOR_EXTERIOR_OPTIONS),
  timeOfDay: optionalSelectSchema(TIME_OF_DAY_OPTIONS),
  lensSize: optionalSelectSchema(LENS_SIZE_OPTIONS),
  lensType: optionalSelectSchema(LENS_TYPE_OPTIONS),
  opticalFormat: optionalSelectSchema(OPTICAL_FORMAT_OPTIONS),
  colour: optionalSelectSchema(COLOUR_OPTIONS),
  set: z.string().max(120).optional().or(z.literal("")),
  colourTags: z.array(z.string().min(1).max(60)).max(10).optional().default([]),
  collaborator: z.array(z.string().min(1).max(100)).max(20).optional().default([]),
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
  title: z.string().max(200).optional().or(z.literal("")),
  filmName: z.string().min(1, "Film name is required").max(200),
  director: z.string().max(200).optional().or(z.literal("")),
  cinematographer: z.string().max(200).optional().or(z.literal("")),
  editor: z.string().max(200).optional().or(z.literal("")),
  actor: z.string().max(200).optional().or(z.literal("")),
  releaseDate: releaseDateSchema,
  description: z.string().max(2000).optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
  shotType: optionalSelectSchema(SHOT_TYPE_OPTIONS),
  aspectRatio: optionalSelectSchema(ASPECT_RATIO_OPTIONS),
  resolution: optionalSelectSchema(RESOLUTION_OPTIONS),
  composition: optionalSelectSchema(COMPOSITION_OPTIONS),
  lighting: optionalSelectSchema(LIGHTING_OPTIONS),
  interiorExterior: optionalSelectSchema(INTERIOR_EXTERIOR_OPTIONS),
  timeOfDay: optionalSelectSchema(TIME_OF_DAY_OPTIONS),
  lensSize: optionalSelectSchema(LENS_SIZE_OPTIONS),
  lensType: optionalSelectSchema(LENS_TYPE_OPTIONS),
  opticalFormat: optionalSelectSchema(OPTICAL_FORMAT_OPTIONS),
  colour: optionalSelectSchema(COLOUR_OPTIONS),
  set: z.string().max(120).optional().or(z.literal("")),
  colourTags: z.array(z.string().min(1).max(60)).max(10).optional().default([]),
  collaborator: z.array(z.string().min(1).max(100)).max(20).optional().default([]),
  folderId: z.string().cuid().optional().nullable(),
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
