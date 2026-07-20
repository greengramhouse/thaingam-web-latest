import Link from "next/link";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { CalendarDays, ImageOff } from "lucide-react";

export type NewsCardData = {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  category: { name: string } | null;
};

export function NewsCard({ news }: { news: NewsCardData }) {
  const date = news.publishedAt ?? news.createdAt;

  return (
    <Link
      href={`/news/${news.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {news.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL มาจากโดเมนใดก็ได้ที่แอดมินวาง
          <img
            src={news.coverImage}
            alt=""
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImageOff className="size-8" aria-hidden="true" />
          </div>
        )}
        {news.category && (
          <span className="absolute left-3 top-3 rounded-full bg-primary/90 px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
            {news.category.name}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-medium text-foreground group-hover:text-primary">{news.title}</h3>
        {news.excerpt && <p className="line-clamp-2 text-sm text-muted-foreground">{news.excerpt}</p>}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5" aria-hidden="true" />
          {format(date, "d MMM yyyy", { locale: th })}
        </span>
      </div>
    </Link>
  );
}
