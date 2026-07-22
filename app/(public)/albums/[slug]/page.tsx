import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Images } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatThaiDate } from "@/lib/date";
import { AlbumLikeButton } from "@/components/public/album-like-button";
import { PhotoGallery } from "@/components/public/photo-gallery";

const getAlbum = cache(async (slug: string) => {
  return prisma.album.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      description: true,
      eventDate: true,
      likeCount: true,
      photos: { orderBy: { order: "asc" }, select: { id: true, url: true, caption: true } },
    },
  });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album) return { title: "ไม่พบอัลบั้ม" };
  return { title: album.title, description: album.description ?? undefined };
}

export default async function AlbumDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const album = await getAlbum(slug);
  if (!album) notFound();

  // อ่านสถานะไลก์ของ visitor นี้ (RSC อ่าน cookie ได้ · ตั้ง cookie ทำใน action ตอนกดไลก์)
  const visitorId = (await cookies()).get("visitor_id")?.value;
  const liked = visitorId
    ? (await prisma.albumLike.count({ where: { albumId: album.id, fingerprint: visitorId } })) > 0
    : false;

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-7 pb-16 sm:px-6">
      <Link
        href="/albums"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        กลับไปหน้าอัลบั้มภาพ
      </Link>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-bold tracking-tight sm:text-[30px]">{album.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-4 text-[13.5px] text-muted-foreground">
            {album.eventDate && (
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays className="size-4" aria-hidden="true" />
                <span className="tabular-nums">{formatThaiDate(album.eventDate, "long")}</span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <Images className="size-4" aria-hidden="true" />
              {album.photos.length} ภาพ
            </span>
          </div>
          {album.description && (
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{album.description}</p>
          )}
        </div>
        <AlbumLikeButton albumId={album.id} initialLiked={liked} initialCount={album.likeCount} />
      </div>

      {album.photos.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card px-6 py-16 text-center text-sm text-muted-foreground">
          อัลบั้มนี้ยังไม่มีรูปภาพ
        </div>
      ) : (
        <PhotoGallery photos={album.photos} />
      )}
    </div>
  );
}
