import Link from "next/link";
import { ArrowRight, Play, ImageOff } from "lucide-react";
import { mediaWorkThumbnail } from "@/lib/media-work";

export type WorkItem = {
  slug: string;
  title: string;
  type: string;
  youtubeUrl: string | null;
  thumbnail: string | null;
};

const TYPE_BADGE: Record<string, string> = {
  YOUTUBE: "bg-[#FBEAEA] text-destructive",
  VIDEO: "bg-[#FBEAEA] text-destructive",
  ARTICLE: "bg-sky-muted text-sky-foreground",
};
const TYPE_LABEL: Record<string, string> = { YOUTUBE: "วิดีโอ", VIDEO: "วิดีโอ", ARTICLE: "บทความ" };

export function WorksSection({ works }: { works: WorkItem[] }) {
  if (works.length === 0) return null;

  return (
    <section className="border-y border-border bg-card">
      <div className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-mint-foreground">
              ผลงานและสื่อการสอน
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-[28px]">สื่อการเรียนรู้ของเรา</h2>
          </div>
          <Link href="/works" className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            ดูทั้งหมด
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {works.map((w) => {
            const thumb = mediaWorkThumbnail(w);
            const isVideo = w.type === "YOUTUBE" || w.type === "VIDEO";
            return (
              <Link
                key={w.slug}
                href={`/works/${w.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element -- URL จากโดเมนใดก็ได้ที่แอดมินวาง
                    <img src={thumb} alt="" className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                      <ImageOff className="size-8" aria-hidden="true" />
                    </div>
                  )}
                  {isVideo && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex size-13 items-center justify-center rounded-full bg-primary/90">
                        <Play className="size-5 translate-x-0.5 fill-white text-white" aria-hidden="true" />
                      </span>
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <span className={`rounded-full px-2 py-0.5 text-[11.5px] font-medium ${TYPE_BADGE[w.type] ?? TYPE_BADGE.ARTICLE}`}>
                    {TYPE_LABEL[w.type] ?? "บทความ"}
                  </span>
                  <h3 className="mt-2.5 line-clamp-2 text-[15.5px] font-semibold leading-snug group-hover:text-primary">
                    {w.title}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
