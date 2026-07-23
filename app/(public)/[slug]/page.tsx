import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { articleProse } from "@/lib/prose";
import { excerptFromHtml } from "@/lib/text";
import { buildOpenGraph, buildTwitter } from "@/lib/metadata";
import { PageHero } from "@/components/public/page-hero";

/**
 * หน้าเนื้อหาสถาบันจาก DB (`Page`) — ระเบียบ/หลักสูตร/ประวัติ ฯลฯ ที่แอดมินแก้เอง
 * dynamic route ท้ายสุด: folder ที่มีชื่อ (/news /works /staff …) match ก่อนเสมอ
 * slug ที่ไม่มีใน DB หรือยัง DRAFT → notFound() (404)
 */
const getPage = cache(async (slug: string) => {
  return prisma.page.findFirst({
    where: { slug, status: "PUBLISHED" },
    select: { title: true, content: true, updatedAt: true },
  });
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: "ไม่พบหน้านี้" };
  // หน้าแบบนี้ไม่มีช่องคำโปรย → ตัดจากเนื้อหามาเป็น description ให้ Google/การ์ดแชร์
  const description = excerptFromHtml(page.content, 155) || undefined;
  return {
    title: page.title,
    description,
    alternates: { canonical: `/${slug}` },
    openGraph: buildOpenGraph({
      type: "article",
      path: `/${slug}`,
      title: page.title,
      description,
      modifiedTime: page.updatedAt,
    }),
    twitter: buildTwitter({ title: page.title, description }),
  };
}

export default async function DynamicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  return (
    <>
      <PageHero breadcrumb={page.title} title={page.title} />
      <div className="mx-auto max-w-[860px] px-4 py-9 pb-16 sm:px-6">
        <div className={articleProse} dangerouslySetInnerHTML={{ __html: page.content }} />
      </div>
    </>
  );
}
