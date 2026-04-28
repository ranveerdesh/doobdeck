import { z } from "zod";
import { isValidInviteCode, normalizeInviteCode } from "./invite-codes";

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

export const stillSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional().or(z.literal("")),
  filmName: z.string().max(200).optional().or(z.literal("")),
  director: z.string().max(200).optional().or(z.literal("")),
  year: z
    .number()
    .int()
    .min(1888, "Year must be 1888 or later")
    // Allow up to 5 years in the future to accommodate pre-production announcements
    .max(new Date().getFullYear() + 5)
    .optional()
    .nullable(),
  notes: z.string().max(5000).optional().or(z.literal("")),
  folderId: z.string().cuid().optional().nullable(),
  categoryId: z.string().cuid().optional().nullable(),
  tags: z.array(z.string().min(1).max(50)).max(20).optional(),
});

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
  filmName: z.string().max(200).optional().or(z.literal("")),
  director: z.string().max(200).optional().or(z.literal("")),
  year: z
    .number()
    .int()
    .min(1888)
    .max(new Date().getFullYear() + 5)
    .optional()
    .nullable(),
  description: z.string().max(2000).optional().or(z.literal("")),
  notes: z.string().max(5000).optional().or(z.literal("")),
  folderId: z.string().cuid().optional().nullable(),
  categoryId: z.string().cuid().optional().nullable(),
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
