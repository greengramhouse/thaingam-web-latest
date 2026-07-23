import "server-only";

/**
 * URL ฐานของเว็บ (absolute) — ใช้กับ `metadataBase`, sitemap, robots, JSON-LD
 *
 * ลำดับ: `NEXT_PUBLIC_SITE_URL` → `BETTER_AUTH_URL` → localhost:4000
 * *(dev ใช้ 4000 เพราะ Windows จองพอร์ต 3000 — ดู roadmap ภาคผนวก A)*
 *
 * ⚠️ ตอน deploy จริงต้องตั้ง `NEXT_PUBLIC_SITE_URL` เป็นโดเมน https ของเว็บ
 * ไม่งั้น sitemap/OG จะชี้ localhost แล้ว Google เก็บ index ไม่ได้
 * `server-only` เพราะ fallback อ่าน env ที่ไม่ใช่ `NEXT_PUBLIC_` (ฝั่ง client จะได้ค่าผิดเงียบ ๆ)
 */
export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.BETTER_AUTH_URL || "http://localhost:4000";
  // ตัด / ท้ายออกเสมอ เพื่อให้ต่อ path ได้โดยไม่เกิด //
  return raw.replace(/\/+$/, "");
}

/** ต่อ path เข้ากับ URL ฐาน → absolute URL */
export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}
