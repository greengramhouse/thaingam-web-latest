import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { formatThaiDate } from "@/lib/date";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/public/page-hero";
import { CoverImage } from "@/components/public/cover-image";
import { TableSearch } from "@/components/admin/table-search";
import { PublicPagination } from "@/components/public/public-pagination";
import { ListSkeleton } from "@/components/public/list-skeleton";

export const metadata: Metadata = {
  title: "ข่าวประชาสัมพันธ์",
  description: "ข่าวสาร กิจกรรม และประกาศต่าง ๆ ของโรงเรียนชุมชนวัดไทยงาม",
};

const PAGE_SIZE = 9;

const pillBase =
  "rounded-full px-4 py-2 text-[13.5px] font-medium transition-colors";

export default async function PublicNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; page?: string }>;
}) {
  const { q, category, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { name: true, slug: true },
  });

  function pillHref(slug?: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (slug) params.set("category", slug);
    const qs = params.toString();
    return qs ? `/news?${qs}` : "/news";
  }

  return (
    <>
      <PageHero
        breadcrumb="ข่าวสาร"
        title="ข่าวประชาสัมพันธ์"
        subtitle="ข่าวสาร กิจกรรม และประกาศต่าง ๆ ของโรงเรียนชุมชนวัดไทยงาม"
      />

      <div className="mx-auto max-w-[1200px] px-4 py-7 pb-16 sm:px-6">
        {/* ตัวกรองหมวด + ค้นหา */}
        <div className="mb-7 flex flex-wrap items-center gap-3">
          <div className="flex flex-1 flex-wrap gap-2">
            <Link
              href={pillHref()}
              className={cn(
                pillBase,
                !category
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:bg-accent",
              )}
            >
              ทั้งหมด
            </Link>
            {categories.map((c) => {
              const active = category === c.slug;
              return (
                <Link
                  key={c.slug}
                  href={pillHref(c.slug)}
                  className={cn(
                    pillBase,
                    active
                      ? "bg-primary text-primary-foreground"
                      : "border border-border bg-card text-muted-foreground hover:bg-accent",
                  )}
                >
                  {c.name}
                </Link>
              );
            })}
          </div>
          <TableSearch placeholder="ค้นหาข่าว" />
        </div>

        {/* กริดข่าว — แยกเป็น Suspense เพื่อให้ขึ้น skeleton ระหว่าง query
            (ไม่ใช้ `loading.tsx` เพราะจะทำให้ `/news/[slug]` ที่ไม่มีจริงตอบ 200 แทน 404 — ดู list-skeleton.tsx) */}
        <Suspense key={`${q ?? ""}|${category ?? ""}|${page}`} fallback={<ListSkeleton />}>
          <NewsResults q={q} category={category} page={page} />
        </Suspense>
      </div>
    </>
  );
}

async function NewsResults({
  q,
  category,
  page,
}: {
  q?: string;
  category?: string;
  page: number;
}) {
  const where: Prisma.NewsWhereInput = {
    status: "PUBLISHED",
    ...(category ? { category: { slug: category } } : {}),
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { excerpt: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, news] = await Promise.all([
    prisma.news.count({ where }),
    prisma.news.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        publishedAt: true,
        createdAt: true,
        category: { select: { name: true } },
      },
    }),
  ]);

  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      {news.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-6 py-20 text-center">
            <p className="font-semibold">{q || category ? "ไม่พบข่าวที่ค้นหา" : "ยังไม่มีข่าว"}</p>
            <p className="text-sm text-muted-foreground">
              {q || category ? "ลองเปลี่ยนคำค้นหรือหมวดหมู่" : "โปรดกลับมาใหม่อีกครั้ง"}
            </p>
          </div>
        ) : (
          <div className="grid gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
            {news.map((n) => (
              <Link
                key={n.slug}
                href={`/news/${n.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <CoverImage src={n.coverImage} ratio="aspect-[16/9]" hover />
                <div className="flex flex-1 flex-col p-[18px]">
                  <div className="mb-2.5 flex items-center gap-2">
                    {n.category && (
                      <span className="rounded-full bg-sky-muted px-2.5 py-0.5 text-xs font-medium text-sky-foreground">
                        {n.category.name}
                      </span>
                    )}
                    <span className="text-[12.5px] text-muted-foreground tabular-nums">
                      {formatThaiDate(n.publishedAt ?? n.createdAt, "medium")}
                    </span>
                  </div>
                  <h3 className="mb-2 text-[16.5px] font-semibold leading-snug group-hover:text-primary">
                    {n.title}
                  </h3>
                  {n.excerpt && (
                    <p className="line-clamp-2 text-[13.5px] leading-relaxed text-muted-foreground">{n.excerpt}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

      <PublicPagination basePath="/news" params={{ q, category }} page={page} pageCount={pageCount} />
    </>
  );
}
