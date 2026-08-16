# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server (localhost:3000)
npm run build        # prisma generate + next build
npm run lint         # eslint via next lint

# Database
npm run db:migrate   # run migrations (dev)
npm run db:migrate:deploy  # run migrations (production/Docker)
npm run db:studio    # open Prisma Studio
npm run db:push      # push schema without migration file
npm run db:seed      # seed with tsx prisma/seed.ts
```

There are no automated tests.

## Architecture

**doobdeck** is a personal film stills directory. Users upload cinematic frames (images), tag them with rich metadata, and browse/search their collection.

### Stack

- Next.js 15 App Router, TypeScript, Tailwind CSS
- PostgreSQL 15 + Prisma ORM
- NextAuth v5 (JWT + Credentials — no OAuth providers)
- Cloudinary for image storage
- Custom colour palette extraction via `sharp` (pixel-bucketing algorithm in `src/lib/colours.ts`)

### Route layout

```
src/app/
  page.tsx                  # root — redirects to /dashboard
  (dashboard)/              # authenticated layout group (Sidebar + Header)
    dashboard/page.tsx
    library/page.tsx
    upload/page.tsx
    stills/[id]/page.tsx
    stills/[id]/edit/page.tsx
    folders/page.tsx
    folders/[id]/page.tsx
    categories/page.tsx
    categories/[id]/page.tsx
  auth/
    sign-in/page.tsx
    sign-up/page.tsx
  api/                      # REST handlers
    upload/route.ts         # multipart — uploads image + creates Still in one step
    stills/route.ts
    stills/[id]/route.ts
    stills/[id]/colours/route.ts
    search/route.ts         # full-text search (raw SQL, see below)
    folders/route.ts / [id]/route.ts
    categories/route.ts / [id]/route.ts
    tags/route.ts
    auth/[...nextauth]/route.ts
    auth/register/route.ts
```

### Key patterns

**Auth.** Every API route calls `const session = await auth()` (from `@/auth`). All data is hard-scoped to `session.user.id` — never trust client-supplied userId.

**Upload flow.** `POST /api/upload` accepts `multipart/form-data` with the image file + all Still metadata. It uploads to Cloudinary, extracts a 6-colour palette with `sharp`, and writes the `Still` + `Colour` rows in one shot. There is no separate "upload image first, save metadata later" flow.

**Search.** `GET /api/search` uses PostgreSQL `websearch_to_tsquery` over a `concat_ws` of all text fields when `q` is present. Without `q` it falls back to Prisma ORM. The raw SQL also searches tag names and colour hex/name via `EXISTS` subqueries.

**Invite-only registration.** `src/lib/invite-codes.ts` holds `VALID_INVITE_CODES`. Add codes there to allow new signups.

**Validation.** Zod schemas in `src/lib/validations.ts` are the source of truth for all field shapes. `stillMetadataSchema` drives the edit form; `uploadSchema` drives the upload form (folderId/categoryId are required at upload time).

**Types.** `src/types/index.ts` exports `StillWithRelations`, `StillSummary`, and other composite types derived from Prisma-generated types.

**Utilities.** `src/lib/cn.ts` — `clsx` + `tailwind-merge`; `src/lib/prisma.ts` — singleton Prisma client; `src/lib/cloudinary.ts` — singleton Cloudinary client.

### Data model (simplified)

```
User
  └─ Still (imageUrl + imagePublicId from Cloudinary)
       ├─ Folder (optional)
       ├─ Category (optional)
       ├─ StillTag[] → Tag
       └─ Colour[] (up to 6, extracted at upload)
```

All entities cascade-delete from User. Folder and Category names are unique per user.

### Still metadata fields

Beyond the obvious (title, filmName, director, year): cinematographer, editor, actor, shotType, aspectRatio, frameSize, composition, lighting, interiorExterior (enum), timeOfDay (enum), lensSize (enum), set, colourTags (string[]). Enum values are defined as `const` arrays in `src/lib/validations.ts`.

## Environment variables

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_URL` | Full app URL |
| `NEXTAUTH_SECRET` | JWT signing secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `INVITE_CODES` | Comma-separated invite codes for registration (e.g. `CODE1,CODE2`) |
