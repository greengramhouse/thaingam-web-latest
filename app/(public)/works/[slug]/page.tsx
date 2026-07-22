import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, ImageOff, User } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatThaiDate } from "@/lib/date";
import { articleProse } from "@/lib/prose";
import { cn } from "@/lib/utils";
import { YouTubeEmbed } from "@/components/public/youtube-embed";

const getWork = cache(async (slug: string) => {
  return prisma.mediaWork.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: {
      title: true,
      description: true,
      type: true,
      youtubeUrl: true,
      videoUrl: true,
      content: true,
      thumbnail: true,
      publishedAt: true,
      createdAt: true,
      author: { select: { name: true } },
      tags: { select: { id: true, name: true } },
    },
  });
});

const TYPE_BADGE: Record<string, string> = {
  YOUTUBE: "bg-[#FBEAEA] text-destructive",
  VIDEO: "bg-[#FBEAEA] text-destructive",
  ARTICLE: "bg-sky-muted text-sky-foreground",
};
const TYPE_LABEL: Record<string, string> = { YOUTUBE: "วิดีโอ", VIDEO: "วิดีโอ", ARTICLE: "บทความ" };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = await getWork(slug);
  if (!work) return { title: "ไม่พบผลงาน" };
  return { title: work.title, description: work.description ?? undefined };
}

export default async function WorkDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const work = await getWork(slug);
  if (!work) notFound();

  const date = work.publishedAt ?? work.createdAt;

  return (
    <div className="mx-auto max-w-[860px] px-4 py-7 pb-16 sm:px-6">
      <Link
        href="/works"
        className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        กลับไปหน้าผลงาน
      </Link>

      <div className="mb-3.5 flex flex-wrap items-center gap-2.5">
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[12.5px] font-medium",
            TYPE_BADGE[work.type] ?? TYPE_BADGE.ARTICLE,
          )}
        >
          {TYPE_LABEL[work.type] ?? "บทความ"}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <CalendarDays className="size-3.5" aria-hidden="true" />
          <span className="tabular-nums">{formatThaiDate(date, "long")}</span>
        </span>
        {work.author?.name && (
          <span className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <User className="size-3.5" aria-hidden="true" />
            {work.author.name}
          </span>
        )}
      </div>

      <h1 className="mb-5 text-[28px] font-bold leading-tight tracking-tight sm:text-[32px]">{work.title}</h1>

      {/* สื่อหลักตามชนิด */}
      <div className="mb-7">
        {work.type === "YOUTUBE" && work.youtubeUrl ? (
          <YouTubeEmbed url={work.youtubeUrl} title={work.title} />
        ) : work.type === "VIDEO" && work.videoUrl ? (
          <video
            controls
            src={work.videoUrl}
            poster={work.thumbnail ?? undefined}
            className="aspect-video w-full rounded-2xl bg-black"
          />
        ) : work.thumbnail ? (
          // ARTICLE: รูปปก (ถ้ามี) — eslint-disable: URL จากโดเมนใดก็ได้ที่แอดมินวาง
          // eslint-disable-next-line @next/next/no-img-element
          <img src={work.thumbnail} alt={work.title} className="aspect-video w-full rounded-2xl bg-muted object-cover" />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            <ImageOff className="size-10" aria-hidden="true" />
          </div>
        )}
      </div>

      {work.description && (
        <p className="mb-6 text-[16px] leading-relaxed text-muted-foreground">{work.description}</p>
      )}

      {/* เนื้อหาบทความ (เฉพาะ ARTICLE) */}
      {work.type === "ARTICLE" && work.content && (
        <div className={articleProse} dangerouslySetInnerHTML={{ __html: work.content }} />
      )}

      {work.tags.length > 0 && (
        <div className="mt-7 flex flex-wrap gap-2 border-t border-border pt-5">
          {work.tags.map((t) => (
            <span key={t.id} className="rounded-full bg-muted px-3 py-1 text-[13px] text-muted-foreground">
              # {t.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
