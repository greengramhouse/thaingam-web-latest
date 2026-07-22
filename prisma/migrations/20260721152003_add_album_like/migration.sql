-- CreateTable
CREATE TABLE "album_like" (
    "id" TEXT NOT NULL,
    "albumId" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "album_like_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "album_like_albumId_idx" ON "album_like"("albumId");

-- CreateIndex
CREATE UNIQUE INDEX "album_like_albumId_fingerprint_key" ON "album_like"("albumId", "fingerprint");

-- AddForeignKey
ALTER TABLE "album_like" ADD CONSTRAINT "album_like_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "album"("id") ON DELETE CASCADE ON UPDATE CASCADE;
