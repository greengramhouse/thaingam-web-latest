import type { Metadata } from "next";
import Link from "next/link";
import { ImageOff, Play } from "lucide-react";
import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { mediaWorkThumbnail } from "@/lib/media-work";
import { cn } from "@/lib/utils";
import { PageHero } from "@/components/public/page-hero";
import { PublicPagination } from "@/components/public/public-pagination";

export const metadata: Metadata = {
  title: "ผลงานและสื่อการสอน",
  description: "คลังสื่อการเรียนรู้ วิดีโอ และบทความจากคุณครูของโรงเรียนชุมชนวัดไทยงาม",
};

const PAGE_SIZE = 9;

const TYPE_BADGE: Record<string, string> = {
  YOUTUBE: "bg-[#FBEAEA] text-destructive",
  VIDEO: "bg-[#FBEAEA] text-destructive",
  ARTICLE: "bg-sky-muted text-sky-foreground",
};
const TYPE_LABEL: Record<string, string> = { YOUTUBE: "วิดีโอ", VIDEO: "วิดีโอ", ARTICLE: "บทความ" };

const TABS = [
  { label: "ทั้งหมด", value: undefined },
  { label: "วิดีโอ", value: "video" },
  { label: "บทความ", value: "article" },
] as const;

/** map แท็บ → เงื่อนไข type ของ Prisma (วิดีโอ = YOUTUBE+VIDEO) */
function typeFilter(tab?: string): Prisma.MediaWorkWhereInput {
  if (tab === "video") return { type: { in: ["YOUTUBE", "VIDEO"] } };
  if (tab === "article") return { type: "ARTICLE" };
  return {};
}

const tabBase = "rounded-full px-[18px] py-2 text-[13.5px] font-medium transition-colors";

export default async function PublicWorksPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; page?: string }>;
}) {
  const { type, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where: Prisma.MediaWorkWhereInput = { status: "PUBLISHED", ...typeFilter(type) };

  const [total, works] = await Promise.all([
    prisma.mediaWork.count({ where }),
    prisma.mediaWork.findMany({
      where,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        slug: true,
        title: true,
        type: true,
        youtubeUrl: true,
        thumbnail: true,
        author: { select: { name: true } },
      },
    }),
  ]);

  const pageCount = Math.ceil(total / PAGE_SIZE);

  function tabHref(value?: string) {
    return value ? `/works?type=${value}` : "/works";
  }

  return (
    <>
      <PageHero
        breadcrumb="ผลงาน · สื่อการสอน"
        title="ผลงานและสื่อการสอน"
        subtitle="คลังสื่อการเรียนรู้ วิดีโอ และบทความจากคุณครูของเรา"
      />

      <div className="mx-auto max-w-[1200px] px-4 py-7 pb-16 sm:px-6">
        <div className="mb-6 flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const active = type === tab.value || (!type && !tab.value);
            return (
              <Link
                key={tab.label}
                href={tabHref(tab.value)}
                className={cn(
                  tabBase,
                  active
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-muted-foreground hover:bg-accent",
                )}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>

        {works.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-6 py-20 text-center">
            <p className="font-semibold">ยังไม่มีผลงานในหมวดนี้</p>
            <p className="text-sm text-muted-foreground">โปรดกลับมาใหม่อีกครั้ง</p>
          </div>
        ) : (
          <div className="grid gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
            {works.map((w) => {
              const thumb = mediaWorkThumbnail(w);
              const isVideo = w.type === "YOUTUBE" || w.type === "VIDEO";
              return (
                <Link
                  key={w.slug}
                  href={`/works/${w.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element -- URL จากโดเมนใดก็ได้ที่แอดมินวาง
                      <img
                        src={thumb}
                        alt=""
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <ImageOff className="size-8" aria-hidden="true" />
                      </div>
                    )}
                    {isVideo && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="flex size-[50px] items-center justify-center rounded-full bg-primary/90">
                          <Play className="size-5 translate-x-0.5 fill-white text-white" aria-hidden="true" />
                        </span>
                      </span>
                    )}
                  </div>
                  <div className="p-[18px]">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-0.5 text-[11.5px] font-medium",
                        TYPE_BADGE[w.type] ?? TYPE_BADGE.ARTICLE,
                      )}
                    >
                      {TYPE_LABEL[w.type] ?? "บทความ"}
                    </span>
                    <h3 className="mt-2.5 mb-1.5 line-clamp-2 text-base font-semibold leading-snug group-hover:text-primary">
                      {w.title}
                    </h3>
                    {w.author?.name && <p className="text-[13px] text-muted-foreground">โดย {w.author.name}</p>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <PublicPagination basePath="/works" params={{ type }} page={page} pageCount={pageCount} />
      </div>
    </>
  );
}
