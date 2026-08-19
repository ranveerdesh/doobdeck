-- Add new columns
ALTER TABLE "Still" ADD COLUMN "releaseDate"   TIMESTAMP;
ALTER TABLE "Still" ADD COLUMN "resolution"    TEXT;
ALTER TABLE "Still" ADD COLUMN "opticalFormat" TEXT;
ALTER TABLE "Still" ADD COLUMN "colour"        TEXT;
ALTER TABLE "Still" ADD COLUMN "lensType"      TEXT;
ALTER TABLE "Still" ADD COLUMN "collaborator"  TEXT[] NOT NULL DEFAULT '{}';

-- Rename frameSize → resolution (copy existing data)
UPDATE "Still" SET "resolution" = "frameSize" WHERE "frameSize" IS NOT NULL;
ALTER TABLE "Still" DROP COLUMN "frameSize";

-- Migrate year → releaseDate (Jan 1 of stored year)
UPDATE "Still" SET "releaseDate" = make_date("year", 1, 1)::timestamp WHERE "year" IS NOT NULL;
ALTER TABLE "Still" DROP COLUMN "year";

-- Make title nullable
ALTER TABLE "Still" ALTER COLUMN "title" DROP NOT NULL;

-- Add releaseDate index
CREATE INDEX "Still_userId_releaseDate_createdAt_idx" ON "Still"("userId", "releaseDate" DESC, "createdAt" DESC);
