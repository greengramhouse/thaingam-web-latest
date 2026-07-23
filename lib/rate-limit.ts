import "server-only";
import { headers } from "next/headers";

/**
 * Rate limit แบบ sliding window เก็บใน **หน่วยความจำของ process**
 *
 * ใช้กับ action สาธารณะที่ไม่ต้องล็อกอิน (ส่งข้อความติดต่อ / กดไลก์) — กันสแปมยิงรัว
 *
 * ⚠️ **ข้อจำกัดที่ต้องรู้ก่อนใช้:**
 * - อยู่ใน memory → **restart แล้วนับใหม่** และถ้ารันหลาย instance/container **แต่ละตัวนับแยกกัน**
 *   (เว็บโรงเรียน 1 container พอ · ถ้าวันหลัง scale หลายตัวค่อยย้ายไป Redis แล้วเปลี่ยนแค่ไฟล์นี้)
 * - กันคนทั่วไปกดรัว/สคริปต์ง่าย ๆ ได้ แต่ไม่ได้กัน DDoS จริง (อันนั้นเป็นงานของ reverse proxy/Cloudflare)
 */

type Hit = { count: number; resetAt: number };

const buckets = new Map<string, Hit>();

/** เก็บกวาดคีย์ที่หมดอายุ ไม่ให้ Map โตไม่จำกัดจาก IP ที่ไม่กลับมาอีก */
function prune(now: number) {
  if (buckets.size < 500) return;
  for (const [key, hit] of buckets) {
    if (hit.resetAt <= now) buckets.delete(key);
  }
}

export type RateLimitResult = { ok: boolean; retryAfterSec: number };

/**
 * นับ 1 ครั้งสำหรับ `key` — เกิน `limit` ครั้งภายใน `windowMs` → `ok:false`
 * *(หน้าต่างเริ่มนับใหม่หลังหมดเวลา ไม่ใช่ token bucket — พอสำหรับงานนี้และอ่านง่าย)*
 */
export function hitRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  prune(now);

  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfterSec: 0 };
  }

  current.count += 1;
  if (current.count > limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
  }
  return { ok: true, retryAfterSec: 0 };
}

/**
 * IP ของผู้เรียก — อ่านจาก header ที่ reverse proxy ใส่มา
 *
 * ⚠️ header พวกนี้ **ปลอมได้** ถ้าไม่มี proxy ที่เชื่อถือได้อยู่หน้าเว็บ
 * (แผน deploy 4.8 มี Caddy ซึ่งเขียน `X-Forwarded-For` ให้เอง → ค่าที่ได้เชื่อถือได้)
 * คืน "unknown" ถ้าอ่านไม่ได้ — คนที่อ่าน IP ไม่ได้จะถูกนับรวมเป็นคีย์เดียวกัน (เข้มไว้ก่อนดีกว่าปล่อยผ่าน)
 */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return h.get("x-real-ip")?.trim() || "unknown";
}
