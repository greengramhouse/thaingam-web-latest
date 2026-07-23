import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Newspaper, PlayCircle, Search as SearchIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatThaiDate } from "@/lib/date";
import { excerptFromHtml } from "@/lib/text";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/public/page-hero";
import { PublicPagination } from "@/components/public/public-pagination";
import { SearchBox } from "@/components/public/search-box";

/** เรนเดอร์ตอนมี request เสมอ — หน้านี้ query DB ห้าม prerender ตอน build (CI ไม่มี DB · problems.md 8.6) */
export const dynamic = "force-dynamic";


export const metadata: Metadata = {
  title: "ค้นหา",
  description: "ค้นหาข่าวสาร ผลงาน/สื่อการสอน และหน้าข้อมูลของโรงเรียนชุมชนวัดไทยงาม",
  // หน้าผลค้นหาไม่ควรถูก index (เนื้อหาซ้ำกับหน้าจริง + สร้าง URL ได้ไม่จำกัด)
  robots: { index: false, follow: true },
};

/** จำนวนผลลัพธ์: แท็บ "ทั้งหมด" โชว์ต่อกลุ่ม · แท็บเจาะจงแบ่งหน้า */
const PREVIEW_SIZE = 4;
const PAGE_SIZE = 10;

type ResultKind = "news" | "works" | "pages";

const KIND_META: Record<ResultKind, { label: string; icon: typeof Newspaper; tile: string }> = {
  news: { label: "ข่าวสาร", icon: Newspaper, tile: "bg-sky-muted text-sky-foreground" },
  works: { label: "ผลงาน / สื่อ", icon: PlayCircle, tile: "bg-mint-muted text-mint-foreground" },
  pages: { label: "หน้าข้อมูล", icon: FileText, tile: "bg-warning-muted text-warning-foreground" },
};

type Hit = { kind: ResultKind; href: string; title: string; snippet: string; meta?: string };

const tabBase = "rounded-full px-[18px] py-2 text-[13.5px] font-medium transition-colors";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}) {
  const { q: rawQ, type: rawType, page: pageParam } = await searchParams;
  const q = rawQ?.trim() ?? "";
  const type: ResultKind | undefined =
    rawType === "news" || rawType === "works" || rawType === "pages" ? rawType : undefined;
  const page = Math.max(1, Number(pageParam) || 1);

  // ยังไม่พิมพ์คำค้น → โชว์แค่ช่องค้นหา + ทางลัด (ไม่ยิง DB)
  if (!q) {
    return (
      <>
        <SearchHero />
        <div className="mx-auto max-w-[820px] px-4 pb-20 sm:px-6">
          <SearchPanel q="" />
          <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-16 text-center">
            <SearchIcon className="size-9 text-muted-foreground/60" aria-hidden="true" />
            <p className="font-semibold">พิมพ์คำที่ต้องการค้นหา</p>
            <p className="text-sm text-muted-foreground">
              ค้นได้ทั้งข่าวสาร ผลงาน/สื่อการสอน และหน้าข้อมูลของโรงเรียน
            </p>
          </div>
        </div>
      </>
    );
  }

  const newsWhere = {
    status: "PUBLISHED" as const,
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { excerpt: { contains: q, mode: "insensitive" as const } },
      { content: { contains: q, mode: "insensitive" as const } },
    ],
  };
  const worksWhere = {
    status: "PUBLISHED" as const,
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { description: { contains: q, mode: "insensitive" as const } },
      { content: { contains: q, mode: "insensitive" as const } },
    ],
  };
  const pagesWhere = {
    status: "PUBLISHED" as const,
    OR: [
      { title: { contains: q, mode: "insensitive" as const } },
      { content: { contains: q, mode: "insensitive" as const } },
    ],
  };

  // นับทุกกลุ่มเสมอ (ใช้ทำเลขบนแท็บ) — take ต่างกันตามแท็บที่เลือก
  const take = type ? PAGE_SIZE : PREVIEW_SIZE;
  const skip = type ? (page - 1) * PAGE_SIZE : 0;

  const [newsCount, worksCount, pagesCount, news, works, pages] = await Promise.all([
    prisma.news.count({ where: newsWhere }),
    prisma.mediaWork.count({ where: worksWhere }),
    prisma.page.count({ where: pagesWhere }),
    type && type !== "news"
      ? []
      : prisma.news.findMany({
          where: newsWhere,
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          skip: type === "news" ? skip : 0,
          take,
          select: {
            slug: true,
            title: true,
            excerpt: true,
            content: true,
            publishedAt: true,
            createdAt: true,
            category: { select: { name: true } },
          },
        }),
    type && type !== "works"
      ? []
      : prisma.mediaWork.findMany({
          where: worksWhere,
          orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
          skip: type === "works" ? skip : 0,
          take,
          select: {
            slug: true,
            title: true,
            description: true,
            content: true,
            type: true,
            publishedAt: true,
            createdAt: true,
          },
        }),
    type && type !== "pages"
      ? []
      : prisma.page.findMany({
          where: pagesWhere,
          orderBy: { updatedAt: "desc" },
          skip: type === "pages" ? skip : 0,
          take,
          select: { slug: true, title: true, content: true, updatedAt: true },
        }),
  ]);

  const newsHits: Hit[] = news.map((n) => ({
    kind: "news",
    href: `/news/${n.slug}`,
    title: n.title,
    snippet: n.excerpt?.trim() || excerptFromHtml(n.content),
    meta: [n.category?.name, formatThaiDate(n.publishedAt ?? n.createdAt, "medium")]
      .filter(Boolean)
      .join(" · "),
  }));

  const workHits: Hit[] = works.map((w) => ({
    kind: "works",
    href: `/works/${w.slug}`,
    title: w.title,
    snippet: w.description?.trim() || (w.content ? excerptFromHtml(w.content) : ""),
    meta: [
      w.type === "ARTICLE" ? "บทความ" : "วิดีโอ",
      formatThaiDate(w.publishedAt ?? w.createdAt, "medium"),
    ].join(" · "),
  }));

  const pageHits: Hit[] = pages.map((p) => ({
    kind: "pages",
    href: `/${p.slug}`,
    title: p.title,
    snippet: excerptFromHtml(p.content),
    meta: `อัปเดต ${formatThaiDate(p.updatedAt, "medium")}`,
  }));

  const total = newsCount + worksCount + pagesCount;
  const counts: Record<ResultKind, number> = { news: newsCount, works: worksCount, pages: pagesCount };
  const groups: { kind: ResultKind; hits: Hit[] }[] = [
    { kind: "news", hits: newsHits },
    { kind: "works", hits: workHits },
    { kind: "pages", hits: pageHits },
  ];

  const activeCount = type ? counts[type] : total;
  const pageCount = type ? Math.ceil(counts[type] / PAGE_SIZE) : 0;

  function tabHref(value?: ResultKind) {
    const params = new URLSearchParams({ q });
    if (value) params.set("type", value);
    return `/search?${params}`;
  }

  return (
    <>
      <SearchHero />

      <div className="mx-auto max-w-[820px] px-4 pb-20 sm:px-6">
        <SearchPanel q={q} />

        {/* แท็บกรองชนิด + จำนวนที่พบ */}
        <div className="mt-7 mb-5 flex flex-wrap items-center gap-2">
          <Link
            href={tabHref()}
            className={cn(
              tabBase,
              !type
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card text-muted-foreground hover:bg-accent",
            )}
          >
            ทั้งหมด ({total})
          </Link>
          {(Object.keys(KIND_META) as ResultKind[]).map((kind) => (
            <Link
              key={kind}
              href={tabHref(kind)}
              className={cn(
                tabBase,
                type === kind
                  ? "bg-primary text-primary-foreground"
                  : "border border-border bg-card text-muted-foreground hover:bg-accent",
              )}
            >
              {KIND_META[kind].label} ({counts[kind]})
            </Link>
          ))}
        </div>

        <p className="mb-5 text-sm text-muted-foreground">
          {activeCount > 0 ? (
            <>
              พบ <span className="font-semibold text-foreground">{activeCount}</span> รายการสำหรับ “
              {q}”
            </>
          ) : (
            <>ไม่พบผลลัพธ์สำหรับ “{q}”</>
          )}
        </p>

        {activeCount === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-6 py-16 text-center">
            <p className="font-semibold">ไม่พบสิ่งที่ค้นหา</p>
            <p className="text-sm text-muted-foreground">
              ลองใช้คำสั้นลง หรือเปลี่ยนคำค้น แล้วค้นหาอีกครั้ง
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-8">
            {groups
              .filter((g) => (type ? g.kind === type : g.hits.length > 0))
              .map((g) => (
                <section key={g.kind}>
                  {/* หัวกลุ่มโชว์เฉพาะแท็บ "ทั้งหมด" — แท็บเจาะจงมีชื่ออยู่บนปุ่มแล้ว */}
                  {!type && (
                    <div className="mb-3 flex items-baseline justify-between gap-3">
                      <h2 className="text-[15px] font-semibold">
                        {KIND_META[g.kind].label}{" "}
                        <span className="text-muted-foreground">({counts[g.kind]})</span>
                      </h2>
                      {counts[g.kind] > g.hits.length && (
                        <Link
                          href={tabHref(g.kind)}
                          className="text-[13px] font-medium text-primary hover:underline"
                        >
                          ดูทั้งหมด →
                        </Link>
                      )}
                    </div>
                  )}
                  <ul className="flex flex-col gap-3">
                    {g.hits.map((hit) => (
                      <ResultRow key={`${hit.kind}-${hit.href}`} hit={hit} />
                    ))}
                  </ul>
                </section>
              ))}
          </div>
        )}

        {type && (
          <PublicPagination basePath="/search" params={{ q, type }} page={page} pageCount={pageCount} />
        )}
      </div>
    </>
  );
}

function SearchHero() {
  return (
    <PageHero
      breadcrumb="ค้นหา"
      title="ค้นหา"
      subtitle="ค้นข่าวสาร ผลงาน/สื่อการสอน และหน้าข้อมูลของโรงเรียน"
    />
  );
}

/** กล่องช่องค้นหาที่ลอยคร่อมขอบล่างของ PageHero */
function SearchPanel({ q }: { q: string }) {
  return (
    <div className="-mt-7 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <SearchBox defaultValue={q} />
    </div>
  );
}

function ResultRow({ hit }: { hit: Hit }) {
  const { icon: Icon, tile } = KIND_META[hit.kind];
  return (
    <li>
      <Link
        href={hit.href}
        className="group flex gap-4 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <span
          className={cn("flex size-11 shrink-0 items-center justify-center rounded-xl", tile)}
          aria-hidden="true"
        >
          <Icon className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold leading-snug group-hover:text-primary">
            {hit.title}
          </span>
          {hit.snippet && (
            <span className="mt-1 line-clamp-2 block text-[13.5px] leading-relaxed text-muted-foreground">
              {hit.snippet}
            </span>
          )}
          {hit.meta && (
            <span className="mt-1.5 block text-[12.5px] text-muted-foreground/80">{hit.meta}</span>
          )}
        </span>
      </Link>
    </li>
  );
}
