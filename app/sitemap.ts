import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site-url";

/**
 * `/sitemap.xml` — หน้าคงที่ + slug ที่ **เผยแพร่แล้ว** เท่านั้น
 * (ร่างต้องไม่หลุดเข้า sitemap เพราะหน้าจริงตอบ 404 อยู่แล้ว — จะกลายเป็น broken link ให้ Google)
 *
 * ⚠️ ไม่ใส่ `/search` (หน้าผลค้นหาไม่ควรถูก index) และไม่ใส่หน้าหลังบ้าน
 *
 * ⚠️ **ต้องมี `revalidate`** — route นี้ไม่ได้ใช้ request-time API เลย Next จึง prerender เป็น static
 * ตอน build (ยืนยันจาก build output: `○ /sitemap.xml`) → ถ้าไม่ตั้ง sitemap จะ **แช่แข็งตั้งแต่วันที่ deploy**
 * แอดมินโพสต์ข่าวใหม่แล้ว Google ไม่เห็น · 1 ชม. กำลังดี (ไม่ต้องยิง DB ทุกครั้งที่ crawler มาเก็บ)
 */
export const revalidate = 3600;

/** หน้าคงที่ + น้ำหนักความสำคัญ */
const STATIC_ROUTES: { path: string; priority: number; changeFrequency: "daily" | "weekly" | "monthly" }[] = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/news", priority: 0.9, changeFrequency: "daily" },
  { path: "/works", priority: 0.8, changeFrequency: "weekly" },
  { path: "/albums", priority: 0.8, changeFrequency: "weekly" },
  { path: "/calendar", priority: 0.7, changeFrequency: "weekly" },
  { path: "/documents", priority: 0.7, changeFrequency: "weekly" },
  { path: "/staff", priority: 0.6, changeFrequency: "monthly" },
  { path: "/about", priority: 0.6, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.6, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [news, works, albums, pages] = await Promise.all([
    prisma.news.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.mediaWork.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.album.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.page.findMany({
      where: { status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  const now = new Date();

  return [
    ...STATIC_ROUTES.map((r) => ({
      url: absoluteUrl(r.path),
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...news.map((n) => ({
      url: absoluteUrl(`/news/${n.slug}`),
      lastModified: n.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...works.map((w) => ({
      url: absoluteUrl(`/works/${w.slug}`),
      lastModified: w.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...albums.map((a) => ({
      url: absoluteUrl(`/albums/${a.slug}`),
      lastModified: a.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    // หน้าเนื้อหาจาก DB (ระเบียบ/หลักสูตร/หน้าที่แอดมินเพิ่มเอง) — route `/[slug]`
    ...pages.map((p) => ({
      url: absoluteUrl(`/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
