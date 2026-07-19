-- CreateTable
CREATE TABLE "album" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "eventDate" TIMESTAMP(3),
    "status" "PublishStatus" NOT NULL DEFAULT 'PUBLISHED',
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo" (
    "id" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "photo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "album_slug_key" ON "album"("slug");

-- CreateIndex
CREATE INDEX "album_status_eventDate_idx" ON "album"("status", "eventDate");

-- CreateIndex
CREATE INDEX "album_authorId_idx" ON "album"("authorId");

-- CreateIndex
CREATE INDEX "photo_albumId_order_idx" ON "photo"("albumId", "order");

-- AddForeignKey
ALTER TABLE "album" ADD CONSTRAINT "album_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "photo" ADD CONSTRAINT "photo_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "album"("id") ON DELETE CASCADE ON UPDATE CASCADE;
