import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

export type Role = "SUPER_ADMIN" | "ADMIN" | "TEACHER";

/** ดึง session ฝั่ง server (จาก cookie) — null ถ้าไม่ล็อกอิน */
export async function getSession() {
  return auth.api.getSession({ headers: await headers() });
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/** ต้องล็อกอิน — ไม่งั้นเด้งไป /login */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** ต้องมี role ที่กำหนด — ไม่งั้นถือว่าไม่มีสิทธิ์ */
export async function requireRole(...allowed: Role[]) {
  const user = await requireAuth();
  if (!allowed.includes(user.role as Role)) {
    // ⏭️ TODO: เปลี่ยนเป็น forbidden() (403) เมื่อเปิด experimental.authInterrupts ใน next.config
    redirect("/");
  }
  return user;
}

/**
 * ADMIN ขึ้นไปเท่านั้นที่จัดการเนื้อหา (ข่าว/ผลงาน/กิจกรรม/...) ได้
 * TEACHER ยังไม่มีสิทธิ์ส่วนนี้ — สงวนไว้ให้ "ข้อมูลภายในโรงเรียน" ในอนาคต (spec §3)
 */
export function canManageContent(role?: string | null) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

/** ADMIN ขึ้นไปเท่านั้นที่ publish ได้ */
export function canPublish(role?: string | null) {
  return canManageContent(role);
}

/** เฉพาะ SUPER_ADMIN จัดการผู้ใช้ได้ */
export function canManageUsers(role?: string | null) {
  return role === "SUPER_ADMIN";
}
