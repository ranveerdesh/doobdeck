-- DropIndex — replaced by indexes that include createdAt so ORDER BY is free
DROP INDEX "Still_userId_idx";
DROP INDEX "Still_userId_folderId_idx";
DROP INDEX "Still_userId_categoryId_idx";

-- CreateIndex
CREATE INDEX "Still_userId_createdAt_idx" ON "Still"("userId", "createdAt" DESC);
CREATE INDEX "Still_userId_folderId_createdAt_idx" ON "Still"("userId", "folderId", "createdAt" DESC);
CREATE INDEX "Still_userId_categoryId_createdAt_idx" ON "Still"("userId", "categoryId", "createdAt" DESC);
