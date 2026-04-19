# doobdeck

A personal film stills directory — upload, organise, and explore the cinematic frames that move you.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | PostgreSQL 15 |
| ORM | Prisma |
| Auth | NextAuth.js v5 (JWT + Credentials) |
| Image storage | Cloudinary |
| Colour extraction | node-vibrant |
| Containerisation | Docker + Docker Compose |

## Prerequisites

- Node.js 20+
- Docker & Docker Compose (for containerised setup)
- A [Cloudinary](https://cloudinary.com/) account (free tier works)

## Quick Start with Docker

```bash
# 1. Clone and enter the repo
git clone https://github.com/your-username/doobdeck.git
cd doobdeck

# 2. Copy and fill in environment variables
cp .env.example .env
# Edit .env with your NEXTAUTH_SECRET and Cloudinary credentials

# 3. Start the app + database
docker compose up --build

# 4. (First run) Run migrations
docker compose exec app npx prisma migrate deploy

# App is running at http://localhost:3000
```

To also start PgAdmin (database UI):
```bash
docker compose --profile tools up
# PgAdmin at http://localhost:5050
```

## Local Development (without Docker)

```bash
# 1. Install dependencies
npm install

# 2. Start a PostgreSQL 15 instance (or use Docker just for the DB)
docker compose up db -d

# 3. Copy and fill in environment variables
cp .env.example .env.local

# 4. Generate Prisma client and run migrations
npm run db:generate
npm run db:migrate

# 5. Start the dev server
npm run dev
# App at http://localhost:3000
```

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `NEXTAUTH_URL` | Full URL of the app (e.g. `http://localhost:3000`) | ✅ |
| `NEXTAUTH_SECRET` | Random secret for JWT signing (use `openssl rand -base64 32`) | ✅ |
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name | ✅ |
| `CLOUDINARY_API_KEY` | Your Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Your Cloudinary API secret | ✅ |
| `PGADMIN_DEFAULT_EMAIL` | PgAdmin login email (Docker tools profile) | optional |
| `PGADMIN_DEFAULT_PASSWORD` | PgAdmin login password (Docker tools profile) | optional |

## API Overview

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new account |
| `POST` | `/api/auth/[...nextauth]` | NextAuth sign-in/sign-out |
| `GET/POST` | `/api/stills` | List or create stills |
| `GET/PATCH/DELETE` | `/api/stills/:id` | Get, update, or delete a still |
| `GET` | `/api/stills/:id/colours` | Get extracted colours for a still |
| `POST` | `/api/upload` | Upload image to Cloudinary + extract palette |
| `GET/POST` | `/api/folders` | List or create folders |
| `PATCH/DELETE` | `/api/folders/:id` | Update or delete a folder |
| `GET/POST` | `/api/categories` | List or create categories |
| `PATCH/DELETE` | `/api/categories/:id` | Update or delete a category |
| `GET` | `/api/tags` | List all tags for the authenticated user |
| `GET` | `/api/search` | Full-text search across stills |

All API routes require authentication. Resources are always scoped to the authenticated user.

## Folder Structure

```
doobdeck/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── migrations/          # SQL migration files
├── src/
│   ├── app/                 # Next.js App Router pages & API routes
│   │   ├── (dashboard)/     # Authenticated layout group
│   │   ├── api/             # REST API handlers
│   │   └── auth/            # Sign-in / sign-up pages
│   ├── components/          # React components
│   │   ├── ui/              # Generic UI primitives
│   │   ├── stills/          # Still-specific components
│   │   ├── layout/          # Sidebar, Header
│   │   ├── search/          # SearchBar, FilterPanel
│   │   ├── folders/         # FolderList
│   │   └── categories/      # CategoryList
│   ├── lib/                 # Utilities (prisma, cloudinary, colours, auth, cn, validations)
│   ├── types/               # TypeScript interfaces
│   ├── auth.ts              # NextAuth configuration
│   ├── auth.config.ts       # Auth pages & callbacks
│   └── middleware.ts        # Route protection
├── docker-compose.yml
├── Dockerfile
└── .env.example
```

## Roadmap

- [ ] Bulk upload
- [ ] Public shareable gallery links
- [ ] Colour-based filtering (click a palette swatch to filter)
- [ ] Export collection as ZIP
- [ ] Mobile-responsive sidebar (drawer)
- [ ] Still comparison view (side-by-side)
- [ ] AI scene description via OpenAI Vision
