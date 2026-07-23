"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { canManageContent, getCurrentUser } from "@/lib/rbac";
import { contactFormSchema } from "@/lib/validations/contact";
import { clientIp, hitRateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "@/server/actions/types";

async function requireContentManager() {
  const user = await getCurrentUser();
  if (!user || !canManageContent(user.role)) return null;
  return user;
}

function revalidateMessages() {
  revalidatePath("/admin/messages");
}

/**
 * ส่งข้อความจากหน้า "ติดต่อเรา" (สาธารณะ — ไม่ต้องล็อกอิน) → สร้าง ContactMessage เข้า inbox แอดมิน
 * กันสแปมด้วย rate limit ต่อ IP (Phase 4.8) — เช็ค**ก่อน** validate เพื่อไม่ให้ยิงรัวมาไล่เดารูปแบบข้อมูลได้ฟรี
 */
const CONTACT_LIMIT = 3;
const CONTACT_WINDOW_MS = 10 * 60 * 1000; // 3 ข้อความ / 10 นาที / IP

export async function submitContactMessage(input: unknown): Promise<ActionResult> {
  const ip = await clientIp();
  const limit = hitRateLimit(`contact:${ip}`, CONTACT_LIMIT, CONTACT_WINDOW_MS);
  if (!limit.ok) {
    const minutes = Math.ceil(limit.retryAfterSec / 60);
    return { ok: false, error: `ส่งข้อความบ่อยเกินไป กรุณารออีก ${minutes} นาทีแล้วลองใหม่` };
  }

  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  try {
    const created = await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        subject: data.subject || null,
        message: data.message,
      },
      select: { id: true },
    });
    revalidateMessages();
    return { ok: true, id: created.id };
  } catch (error) {
    console.error("submitContactMessage failed:", error);
    return { ok: false, error: "ส่งข้อความไม่สำเร็จ กรุณาลองใหม่" };
  }
}

/** ตั้งสถานะอ่าน/ยังไม่อ่าน — auto-mark ตอนเปิดอ่าน (read=true) หรือปุ่มสลับในลิสต์ */
export async function setMessageRead(id: string, read: boolean): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const existing = await prisma.contactMessage.findUnique({ where: { id }, select: { isRead: true } });
  if (!existing) return { ok: false, error: "ไม่พบข้อความนี้" };

  // ไม่มีอะไรเปลี่ยน → ไม่ต้องเขียน/revalidate (auto-mark ตอนเปิดข้อความที่อ่านแล้วจะไม่ยิง DB ซ้ำ)
  if (existing.isRead === read) return { ok: true, id };

  try {
    await prisma.contactMessage.update({ where: { id }, data: { isRead: read }, select: { id: true } });
    revalidateMessages();
    return { ok: true, id };
  } catch (error) {
    console.error("setMessageRead failed:", error);
    return { ok: false, error: "เปลี่ยนสถานะไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function deleteContactMessage(id: string): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  try {
    const msg = await prisma.contactMessage.delete({ where: { id }, select: { id: true } });
    revalidateMessages();
    return { ok: true, id: msg.id };
  } catch (error) {
    console.error("deleteContactMessage failed:", error);
    return { ok: false, error: "ลบไม่สำเร็จ กรุณาลองใหม่" };
  }
}
