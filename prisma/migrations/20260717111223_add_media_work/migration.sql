-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('YOUTUBE', 'VIDEO', 'ARTICLE');

-- AlterTable
ALTER TABLE "category" RENAME CONSTRAINT "Category_pkey" TO "category_pkey";

-- AlterTable
ALTER TABLE "tag" RENAME CONSTRAINT "Tag_pkey" TO "tag_pkey";

-- CreateTable
CREATE TABLE "media_work" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "type" "MediaType" NOT NULL,
    "youtubeUrl" TEXT,
    "videoUrl" TEXT,
    "content" TEXT,
    "thumbnail" TEXT,
    "status" "PublishStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3),
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "media_work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_MediaWorkToTag" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MediaWorkToTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "media_work_slug_key" ON "media_work"("slug");

-- CreateIndex
CREATE INDEX "media_work_type_status_idx" ON "media_work"("type", "status");

-- CreateIndex
CREATE INDEX "media_work_status_publishedAt_idx" ON "media_work"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "media_work_authorId_idx" ON "media_work"("authorId");

-- CreateIndex
CREATE INDEX "_MediaWorkToTag_B_index" ON "_MediaWorkToTag"("B");

-- AddForeignKey
ALTER TABLE "media_work" ADD CONSTRAINT "media_work_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaWorkToTag" ADD CONSTRAINT "_MediaWorkToTag_A_fkey" FOREIGN KEY ("A") REFERENCES "media_work"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MediaWorkToTag" ADD CONSTRAINT "_MediaWorkToTag_B_fkey" FOREIGN KEY ("B") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Category_slug_key" RENAME TO "category_slug_key";

-- RenameIndex
ALTER INDEX "Tag_slug_key" RENAME TO "tag_slug_key";
