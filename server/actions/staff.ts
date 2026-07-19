"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { canManageContent, getCurrentUser } from "@/lib/rbac";
import { staffFormSchema } from "@/lib/validations/staff";
import type { ActionResult } from "@/server/actions/types";

async function requireContentManager() {
  const user = await getCurrentUser();
  if (!user || !canManageContent(user.role)) return null;
  return user;
}

function revalidateStaff() {
  revalidatePath("/admin/staff");
  revalidatePath("/staff"); // หน้าทำเนียบบุคลากรสาธารณะ (Phase 4.6)
}

type Parsed = ReturnType<typeof staffFormSchema.parse>;

/** แปลง field ของฟอร์ม (string + ค่าว่าง) → รูปที่บันทึกลง DB · order string → number */
function toStaffData(data: Parsed) {
  return {
    name: data.name,
    position: data.position,
    department: data.department || null,
    email: data.email || null,
    phone: data.phone || null,
    bio: data.bio || null,
    photo: data.photo || null,
    order: Number(data.order),
    isActive: data.isActive,
  };
}

export async function createStaff(input: unknown): Promise<ActionResult> {
  const user = await requireContentManager();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const parsed = staffFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const staff = await prisma.staff.create({ data: toStaffData(parsed.data), select: { id: true } });
    revalidateStaff();
    return { ok: true, id: staff.id };
  } catch (error) {
    console.error("createStaff failed:", error);
    return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function updateStaff(id: string, input: unknown): Promise<ActionResult> {
  const user = await requireContentManager();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const parsed = staffFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.staff.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return { ok: false, error: "ไม่พบบุคลากรนี้" };

  try {
    const staff = await prisma.staff.update({
      where: { id },
      data: toStaffData(parsed.data),
      select: { id: true },
    });
    revalidateStaff();
    return { ok: true, id: staff.id };
  } catch (error) {
    console.error("updateStaff failed:", error);
    return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function deleteStaff(id: string): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  try {
    const staff = await prisma.staff.delete({ where: { id }, select: { id: true } });
    revalidateStaff();
    return { ok: true, id: staff.id };
  } catch (error) {
    console.error("deleteStaff failed:", error);
    return { ok: false, error: "ลบไม่สำเร็จ กรุณาลองใหม่" };
  }
}

/** สลับแสดง/ซ่อนบนหน้าเว็บ (isActive) — บทบาทเดียวกับ togglePublish ของ module อื่น */
export async function toggleStaffActive(id: string): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const existing = await prisma.staff.findUnique({ where: { id }, select: { isActive: true } });
  if (!existing) return { ok: false, error: "ไม่พบบุคลากรนี้" };

  try {
    const staff = await prisma.staff.update({
      where: { id },
      data: { isActive: !existing.isActive },
      select: { id: true },
    });
    revalidateStaff();
    return { ok: true, id: staff.id };
  } catch (error) {
    console.error("toggleStaffActive failed:", error);
    return { ok: false, error: "เปลี่ยนสถานะไม่สำเร็จ กรุณาลองใหม่" };
  }
}
