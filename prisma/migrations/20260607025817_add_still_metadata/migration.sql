-- AlterTable
ALTER TABLE "Still" ADD COLUMN     "actor" TEXT,
ADD COLUMN     "aspectRatio" TEXT,
ADD COLUMN     "cinematographer" TEXT,
ADD COLUMN     "colourTags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "composition" TEXT,
ADD COLUMN     "editor" TEXT,
ADD COLUMN     "frameSize" TEXT,
ADD COLUMN     "interiorExterior" TEXT,
ADD COLUMN     "lensSize" TEXT,
ADD COLUMN     "lighting" TEXT,
ADD COLUMN     "set" TEXT,
ADD COLUMN     "shotType" TEXT,
ADD COLUMN     "timeOfDay" TEXT;
