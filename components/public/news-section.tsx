import Link from "next/link";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { ArrowRight, ChevronRight, ImageOff } from "lucide-react";
import type { NewsCardData } from "@/components/public/news-card";

function newsDate(n: NewsCardData) {
  return format(n.publishedAt ?? n.createdAt, "d MMM yyyy", { locale: th });
}

function Cover({ src, ratio }: { src: string | null; ratio: string }) {
  return (
    <div className={`relative ${ratio} overflow-hidden bg-muted`}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element -- URL จากโดเมนใดก็ได้ที่แอดมินวาง
        <img src={src} alt="" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
      ) : (
        <div className="flex size-full items-center justify-center text-muted-foreground">
          <ImageOff className="size-8" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

export function NewsSection({ items }: { items: NewsCardData[] }) {
  if (items.length === 0) return null;
  const [featured, ...rest] = items;
  const small = rest.slice(0, 4);

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-sky-foreground">
            ข่าวสารและกิจกรรม
          </div>
          <h2 className="text-2xl font-bold tracking-tight sm:text-[28px]">ข่าวประชาสัมพันธ์ล่าสุด</h2>
        </div>
        <Link href="/news" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          <span className="hidden sm:inline">ดูข่าวทั้งหมด</span>
          <span className="sm:hidden">ทั้งหมด</span>
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        {/* ข่าวเด่น */}
        <Link
          href={`/news/${featured.slug}`}
          className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:col-span-2 lg:col-span-1 lg:row-span-2"
        >
          <Cover src={featured.coverImage} ratio="aspect-[16/10]" />
          <div className="flex flex-1 flex-col p-5 sm:p-[22px]">
            <div className="mb-3 flex items-center gap-2">
              {featured.category && (
                <span className="rounded-full bg-sky-muted px-2.5 py-0.5 text-xs font-medium text-sky-foreground">
                  {featured.category.name}
                </span>
              )}
              <span className="text-[12.5px] text-muted-foreground tabular-nums">{newsDate(featured)}</span>
            </div>
            <h3 className="mb-2.5 text-lg font-semibold leading-snug group-hover:text-primary sm:text-xl">
              {featured.title}
            </h3>
            {featured.excerpt && (
              <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{featured.excerpt}</p>
            )}
            <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-medium text-primary">
              อ่านต่อ
              <ChevronRight className="size-4" aria-hidden="true" />
            </span>
          </div>
        </Link>

        {/* ข่าวย่อย */}
        {small.map((n) => (
          <Link
            key={n.slug}
            href={`/news/${n.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <Cover src={n.coverImage} ratio="aspect-[16/9]" />
            <div className="p-4">
              <div className="mb-2 flex items-center gap-2">
                {n.category && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[11.5px] font-medium text-muted-foreground">
                    {n.category.name}
                  </span>
                )}
                <span className="text-xs text-muted-foreground tabular-nums">{newsDate(n)}</span>
              </div>
              <h3 className="line-clamp-2 text-[15.5px] font-semibold leading-snug group-hover:text-primary">
                {n.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
