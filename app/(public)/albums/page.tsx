import type { Metadata } from "next";
import Link from "next/link";
import { Heart, ImageIcon, Images } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatThaiDate } from "@/lib/date";
import { PageHero } from "@/components/public/page-hero";

export const metadata: Metadata = {
  title: "อัลบั้มภาพ",
  description: "ภาพกิจกรรมและบรรยากาศต่าง ๆ ของโรงเรียนชุมชนวัดไทยงาม",
};

export default async function AlbumsPage() {
  const albums = await prisma.album.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ eventDate: "desc" }, { createdAt: "desc" }],
    select: {
      slug: true,
      title: true,
      coverImage: true,
      eventDate: true,
      likeCount: true,
      photos: { orderBy: { order: "asc" }, take: 1, select: { url: true } },
      _count: { select: { photos: true } },
    },
  });

  return (
    <>
      <PageHero
        breadcrumb="อัลบั้มภาพ"
        title="อัลบั้มภาพกิจกรรม"
        subtitle="รวมภาพความประทับใจจากกิจกรรมต่าง ๆ ของโรงเรียน"
      />

      <div className="mx-auto max-w-[1200px] px-4 py-9 pb-16 sm:px-6">
        {albums.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-6 py-20 text-center">
            <p className="font-semibold">ยังไม่มีอัลบั้มภาพ</p>
            <p className="text-sm text-muted-foreground">โปรดกลับมาใหม่อีกครั้ง</p>
          </div>
        ) : (
          <div className="grid gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
            {albums.map((a) => {
              const cover = a.coverImage ?? a.photos[0]?.url ?? null;
              return (
                <Link
                  key={a.slug}
                  href={`/albums/${a.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    {cover ? (
                      // eslint-disable-next-line @next/next/no-img-element -- URL จากโดเมนใดก็ได้ที่แอดมินวาง
                      <img
                        src={cover}
                        alt=""
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <ImageIcon className="size-9" aria-hidden="true" />
                      </div>
                    )}
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[12px] font-medium text-white backdrop-blur">
                      <Images className="size-3.5" aria-hidden="true" />
                      {a._count.photos}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-[18px]">
                    <h3 className="mb-1.5 line-clamp-2 text-[16.5px] font-semibold leading-snug group-hover:text-primary">
                      {a.title}
                    </h3>
                    <div className="mt-auto flex items-center justify-between pt-2 text-[12.5px] text-muted-foreground">
                      <span className="tabular-nums">
                        {a.eventDate ? formatThaiDate(a.eventDate, "medium") : ""}
                      </span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Heart className="size-3.5" aria-hidden="true" />
                        {a.likeCount.toLocaleString("th-TH")}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
