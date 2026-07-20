"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { canManageContent, getCurrentUser } from "@/lib/rbac";
import { parseEventDateInput } from "@/lib/event";
import { announcementFormSchema } from "@/lib/validations/announcement";
import type { ActionResult } from "@/server/actions/types";

async function requireContentManager() {
  const user = await getCurrentUser();
  if (!user || !canManageContent(user.role)) return null;
  return user;
}

function revalidateAnnouncements() {
  revalidatePath("/admin/announcements");
  revalidatePath("/"); // แถบประกาศด่วนหน้าแรก (Phase 4.5)
}

type Parsed = ReturnType<typeof announcementFormSchema.parse>;

/** แปลง field ของฟอร์ม (string + ค่าว่าง) → รูปที่บันทึกลง DB · วันที่ string → Date */
function toAnnouncementData(data: Parsed) {
  return {
    message: data.message.trim(),
    linkUrl: data.linkUrl?.trim() || null,
    startsAt: data.startsAt ? parseEventDateInput(data.startsAt, false) : null,
    endsAt: data.endsAt ? parseEventDateInput(data.endsAt, false) : null,
    isActive: data.isActive,
  };
}

export async function createAnnouncement(input: unknown): Promise<ActionResult> {
  const user = await requireContentManager();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const parsed = announcementFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const announcement = await prisma.announcement.create({
      data: toAnnouncementData(parsed.data),
      select: { id: true },
    });
    revalidateAnnouncements();
    return { ok: true, id: announcement.id };
  } catch (error) {
    console.error("createAnnouncement failed:", error);
    return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function updateAnnouncement(id: string, input: unknown): Promise<ActionResult> {
  const user = await requireContentManager();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const parsed = announcementFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.announcement.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return { ok: false, error: "ไม่พบประกาศนี้" };

  try {
    const announcement = await prisma.announcement.update({
      where: { id },
      data: toAnnouncementData(parsed.data),
      select: { id: true },
    });
    revalidateAnnouncements();
    return { ok: true, id: announcement.id };
  } catch (error) {
    console.error("updateAnnouncement failed:", error);
    return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function deleteAnnouncement(id: string): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  try {
    const announcement = await prisma.announcement.delete({ where: { id }, select: { id: true } });
    revalidateAnnouncements();
    return { ok: true, id: announcement.id };
  } catch (error) {
    console.error("deleteAnnouncement failed:", error);
    return { ok: false, error: "ลบไม่สำเร็จ กรุณาลองใหม่" };
  }
}

/** สลับเปิด/ปิดการแสดงประกาศ (isActive) */
export async function toggleAnnouncementActive(id: string): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const existing = await prisma.announcement.findUnique({ where: { id }, select: { isActive: true } });
  if (!existing) return { ok: false, error: "ไม่พบประกาศนี้" };

  try {
    const announcement = await prisma.announcement.update({
      where: { id },
      data: { isActive: !existing.isActive },
      select: { id: true },
    });
    revalidateAnnouncements();
    return { ok: true, id: announcement.id };
  } catch (error) {
    console.error("toggleAnnouncementActive failed:", error);
    return { ok: false, error: "เปลี่ยนสถานะไม่สำเร็จ กรุณาลองใหม่" };
  }
}
