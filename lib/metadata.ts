import type { Metadata } from "next";

/**
 * ค่ากลางของ metadata ทั้งเว็บ + ตัวช่วยสร้าง `openGraph`
 *
 * ⚠️ **เหตุผลที่ต้องมีไฟล์นี้:** Next merge metadata ระหว่าง layout กับ page แบบ **shallow**
 * → หน้าไหนประกาศ `openGraph` เอง จะ **ทับของ layout ทั้งก้อน** (siteName/locale/รูปหายหมด)
 * แทนที่จะก็อป field ซ้ำทุกหน้า ให้เรียก `buildOpenGraph()` ตัวเดียว
 * *(Next docs `generate-metadata.md` §Ordering แนะนำวิธีนี้ตรง ๆ — ยกค่าที่ใช้ร่วมออกเป็นตัวแปร)*
 */

export const SITE_NAME = "โรงเรียนชุมชนวัดไทยงาม";
export const SITE_DESCRIPTION =
  "เว็บไซต์ประชาสัมพันธ์โรงเรียนชุมชนวัดไทยงาม — ข่าวสาร ผลงาน/สื่อการสอน ปฏิทินกิจกรรม และข้อมูลโรงเรียน";

/** ขนาดมาตรฐานการ์ดแชร์ (Facebook/LINE/X) — ใช้ทั้งตอนสร้างรูปและตอนประกาศ meta */
export const OG_SIZE = { width: 1200, height: 630 } as const;

/** รูป OG เริ่มต้น — route `app/og.png/route.tsx` (URL คงที่ อ้างอิงซ้ำได้ ต่างจาก file convention) */
export const DEFAULT_OG_IMAGE = {
  url: "/og.png",
  ...OG_SIZE,
  alt: SITE_NAME,
};

type OpenGraph = NonNullable<Metadata["openGraph"]>;

/**
 * สร้าง `openGraph` ที่มี siteName/locale ครบเสมอ
 * `image` = รูปปกจริงของเนื้อหา (ถ้ามี) ไม่มีก็ตกไปใช้รูป OG ของเว็บ
 */
export function buildOpenGraph(opts: {
  title?: string;
  description?: string | null;
  path?: string;
  type?: "website" | "article";
  image?: string | null;
  publishedTime?: Date | null;
  modifiedTime?: Date | null;
}): OpenGraph {
  const { title, description, path, type = "website", image, publishedTime, modifiedTime } = opts;

  return {
    siteName: SITE_NAME,
    locale: "th_TH",
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(path ? { url: path } : {}),
    images: [image ? { url: image } : DEFAULT_OG_IMAGE],
    ...(type === "article"
      ? {
          type: "article" as const,
          ...(publishedTime ? { publishedTime: publishedTime.toISOString() } : {}),
          ...(modifiedTime ? { modifiedTime: modifiedTime.toISOString() } : {}),
        }
      : { type: "website" as const }),
  };
}

/** การ์ด Twitter/X ให้สอดคล้องกับ OG (ไม่ตั้ง = บางแพลตฟอร์มไม่ขึ้นรูปใหญ่) */
export function buildTwitter(opts: { title?: string; description?: string | null; image?: string | null }) {
  return {
    card: "summary_large_image" as const,
    ...(opts.title ? { title: opts.title } : {}),
    ...(opts.description ? { description: opts.description } : {}),
    images: [opts.image || DEFAULT_OG_IMAGE.url],
  };
}
