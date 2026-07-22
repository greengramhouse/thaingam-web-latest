import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Eye, ImageOff } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatThaiDate } from "@/lib/date";
import { articleProse } from "@/lib/prose";
import { CoverImage } from "@/components/public/cover-image";
import { NewsViewCounter } from "@/components/public/news-view-counter";

/** ดึงข่าวที่เผยแพร่แล้วตาม slug — cache กัน query ซ้ำระหว่าง generateMetadata กับหน้า */
const getNews = cache(async (slug: string) => {
  return prisma.news.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      id: true,
      title: true,
      excerpt: true,
      content: true,
      coverImage: true,
      publishedAt: true,
      createdAt: true,
      viewCount: true,
      categoryId: true,
      category: { select: { name: true } },
      tags: { select: { id: true, name: true } },
    },
  });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const news = await getNews(slug);
  if (!news) return { title: "ไม่พบข่าว" };
  return {
    title: news.title,
    description: news.excerpt ?? undefined,
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const news = await getNews(slug);
  if (!news) notFound();

  const related = await prisma.news.findMany({
    where: {
      status: "PUBLISHED",
      slug: { not: slug },
      ...(news.categoryId ? { categoryId: news.categoryId } : {}),
    },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    take: 3,
    select: { slug: true, title: true, coverImage: true, publishedAt: true, createdAt: true },
  });

  const publishedDate = news.publishedAt ?? news.createdAt;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-7 pb-16 sm:px-6">
      {/* นับวิวหลังหน้าโหลดจริง (client) */}
      <NewsViewCounter id={news.id} />

      <Link
        href="/news"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        กลับไปหน้าข่าวสาร
      </Link>

      <div className="grid items-start gap-10 lg:grid-cols-[1fr_320px]">
        <article className="min-w-0">
          <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
            {news.category && (
              <span className="rounded-full bg-sky-muted px-2.5 py-0.5 text-[12.5px] font-medium text-sky-foreground">
                {news.category.name}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              <span className="tabular-nums">{formatThaiDate(publishedDate, "long")}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
              <Eye className="size-3.5" aria-hidden="true" />
              <span className="tabular-nums">{news.viewCount.toLocaleString("th-TH")}</span>
            </span>
          </div>

          <h1 className="mb-5 text-[28px] font-bold leading-tight tracking-tight sm:text-[32px]">{news.title}</h1>

          <div className="mb-7">
            <CoverImage
              src={news.coverImage}
              alt={news.title}
              ratio="aspect-[16/9]"
              rounded="rounded-2xl"
              iconClassName="size-10"
            />
          </div>

          {/* เนื้อหา rich text จาก Tiptap (เขียนโดยแอดมินที่เชื่อถือได้ · sanitize อยู่ใน Phase 4.8) */}
          <div className={articleProse} dangerouslySetInnerHTML={{ __html: news.content }} />

          {news.tags.length > 0 && (
            <div className="mt-7 flex flex-wrap gap-2 border-t border-border pt-5">
              {news.tags.map((t) => (
                <span key={t.id} className="rounded-full bg-muted px-3 py-1 text-[13px] text-muted-foreground">
                  # {t.name}
                </span>
              ))}
            </div>
          )}
        </article>

        <aside className="lg:sticky lg:top-[90px]">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold">ข่าวที่เกี่ยวข้อง</h2>
            {related.length === 0 ? (
              <p className="text-sm text-muted-foreground">ยังไม่มีข่าวอื่น</p>
            ) : (
              <div className="flex flex-col gap-4">
                {related.map((r) => (
                  <Link key={r.slug} href={`/news/${r.slug}`} className="group flex gap-3">
                    <div className="relative size-[56px] w-[72px] shrink-0 overflow-hidden rounded-[9px] bg-muted">
                      {r.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element -- URL จากโดเมนใดก็ได้ที่แอดมินวาง
                        <img src={r.coverImage} alt="" className="size-full object-cover" />
                      ) : (
                        <div className="flex size-full items-center justify-center text-muted-foreground">
                          <ImageOff className="size-4" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="mb-1 line-clamp-2 text-[13.5px] font-semibold leading-snug group-hover:text-primary">
                        {r.title}
                      </h3>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {formatThaiDate(r.publishedAt ?? r.createdAt, "medium")}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
