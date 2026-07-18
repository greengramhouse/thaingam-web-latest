"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { canManageContent, getCurrentUser } from "@/lib/rbac";
import { eventFormSchema } from "@/lib/validations/event";
import { parseEventDateInput } from "@/lib/event";
import type { ActionResult } from "@/server/actions/types";

async function requireContentManager() {
  const user = await getCurrentUser();
  if (!user || !canManageContent(user.role)) return null;
  return user;
}

function revalidateEvents() {
  revalidatePath("/admin/events");
  revalidatePath("/calendar"); // หน้าปฏิทินสาธารณะ (Phase 4.6)
}

type Parsed = ReturnType<typeof eventFormSchema.parse>;

/**
 * แปลง field ของฟอร์ม (string วันที่ + ค่าว่าง) → รูปที่บันทึกลง DB
 * startDate ผ่าน validation มาแล้วจึงมั่นใจว่า parse ได้ (ใช้ `!`) · endDate ว่าง = null
 */
function toEventData(data: Parsed) {
  return {
    title: data.title,
    description: data.description || null,
    location: data.location || null,
    allDay: data.allDay,
    startDate: parseEventDateInput(data.startDate, data.allDay)!,
    endDate: data.endDate ? parseEventDateInput(data.endDate, data.allDay) : null,
    color: data.color || null,
    coverImage: data.coverImage || null,
    status: data.status,
  };
}

export async function createEvent(input: unknown): Promise<ActionResult> {
  const user = await requireContentManager();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const parsed = eventFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const event = await prisma.event.create({
      data: { ...toEventData(parsed.data), authorId: user.id },
      select: { id: true },
    });
    revalidateEvents();
    return { ok: true, id: event.id };
  } catch (error) {
    console.error("createEvent failed:", error);
    return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function updateEvent(id: string, input: unknown): Promise<ActionResult> {
  const user = await requireContentManager();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const parsed = eventFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.event.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return { ok: false, error: "ไม่พบกิจกรรมนี้" };

  try {
    const event = await prisma.event.update({
      where: { id },
      data: toEventData(parsed.data),
      select: { id: true },
    });
    revalidateEvents();
    return { ok: true, id: event.id };
  } catch (error) {
    console.error("updateEvent failed:", error);
    return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  try {
    const event = await prisma.event.delete({ where: { id }, select: { id: true } });
    revalidateEvents();
    return { ok: true, id: event.id };
  } catch (error) {
    console.error("deleteEvent failed:", error);
    return { ok: false, error: "ลบไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function toggleEventPublish(id: string): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const existing = await prisma.event.findUnique({ where: { id }, select: { status: true } });
  if (!existing) return { ok: false, error: "ไม่พบกิจกรรมนี้" };

  const nextStatus = existing.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

  try {
    const event = await prisma.event.update({
      where: { id },
      data: { status: nextStatus },
      select: { id: true },
    });
    revalidateEvents();
    return { ok: true, id: event.id };
  } catch (error) {
    console.error("toggleEventPublish failed:", error);
    return { ok: false, error: "เปลี่ยนสถานะไม่สำเร็จ กรุณาลองใหม่" };
  }
}
