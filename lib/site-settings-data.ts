import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * อ่านตั้งค่าเว็บไซต์ (key-value) เป็น map — ใช้ใน Navbar/Footer/หน้า public
 * ครอบด้วย React `cache` → ต่อ 1 request หลาย component เรียกได้ ยิง DB ครั้งเดียว
 */
export const getSiteSettings = cache(async (): Promise<Record<string, string>> => {
  const rows = await prisma.siteSetting.findMany({ select: { key: true, value: true } });
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
});

/**
 * แผนที่ที่แอดมินวางมา อาจเป็น URL ตรง ๆ หรือโค้ด `<iframe … src="…">`
 * → ดึงเฉพาะ src ออกมาเพื่อฝังใน <iframe> ของเราเอง (ไม่ inject HTML ทั้งก้อนจากผู้ใช้)
 * คืน null ถ้าไม่มี/รูปแบบไม่ปลอดภัย (ยอมเฉพาะ https ของ google maps)
 */
export function mapEmbedSrc(value: string | undefined | null): string | null {
  if (!value) return null;
  const raw = value.trim();

  // ถ้าเป็นโค้ด iframe → ดึง src ในเครื่องหมายคำพูด
  const match = raw.match(/src\s*=\s*["']([^"']+)["']/i);
  const candidate = match ? match[1] : raw;

  try {
    const url = new URL(candidate);
    if (url.protocol !== "https:") return null;
    // ยอมเฉพาะโดเมน google maps (กัน XSS/embed มั่ว)
    if (!/(^|\.)google\.com$/.test(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}
