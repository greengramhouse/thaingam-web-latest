"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isUniqueError } from "@/lib/prisma-errors";
import { canManageContent, getCurrentUser } from "@/lib/rbac";
import { normalizeDepartment } from "@/lib/staff";
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

/** แปลง field ของฟอร์ม (string + ค่าว่าง) → รูปที่บันทึกลง DB · `order` ไม่อยู่ในฟอร์ม คิดให้เอง */
function toStaffData(data: Parsed) {
  return {
    name: data.name,
    position: data.position,
    department: normalizeDepartment(data.department),
    email: data.email || null,
    phone: data.phone || null,
    bio: data.bio || null,
    photo: data.photo || null,
    isActive: data.isActive,
  };
}

/**
 * สร้างแถวลำดับกลุ่มให้ฝ่ายที่ยังไม่เคยมี — ต่อท้ายเสมอ
 * แอดมินพิมพ์ชื่อฝ่ายในฟอร์มได้เลย ไม่ต้องมาสร้าง "กลุ่ม" ก่อน (ดู schema.prisma)
 */
async function ensureDepartment(name: string | null) {
  if (!name) return;

  const existing = await prisma.staffDepartment.findUnique({ where: { name }, select: { id: true } });
  if (existing) return;

  const last = await prisma.staffDepartment.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
  try {
    await prisma.staffDepartment.create({ data: { name, order: (last?.order ?? -1) + 1 } });
  } catch (error) {
    // สองแท็บบันทึกฝ่ายชื่อเดียวกันพร้อมกัน — อีกฝั่งสร้างสำเร็จไปแล้ว ถือว่าจบงาน
    if (!isUniqueError(error, "name")) throw error;
  }
}

/** ลำดับถัดไปในกลุ่มนั้น (ต่อท้าย) — `Staff.order` นับกันเองภายในกลุ่ม */
async function nextOrderInDepartment(department: string | null) {
  const last = await prisma.staff.findFirst({
    where: { department },
    orderBy: { order: "desc" },
    select: { order: true },
  });
  return (last?.order ?? -1) + 1;
}

export async function createStaff(input: unknown): Promise<ActionResult> {
  const user = await requireContentManager();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const parsed = staffFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const data = toStaffData(parsed.data);
    await ensureDepartment(data.department);

    const staff = await prisma.staff.create({
      data: { ...data, order: await nextOrderInDepartment(data.department) },
      select: { id: true },
    });
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

  const existing = await prisma.staff.findUnique({ where: { id }, select: { department: true, order: true } });
  if (!existing) return { ok: false, error: "ไม่พบบุคลากรนี้" };

  try {
    const data = toStaffData(parsed.data);
    await ensureDepartment(data.department);

    // ย้ายฝ่าย → ลำดับเดิมเป็นของกลุ่มเก่า ใช้ต่อไม่ได้ ให้ไปต่อท้ายกลุ่มใหม่
    const movedGroup = data.department !== existing.department;
    const order = movedGroup ? await nextOrderInDepartment(data.department) : existing.order;

    const staff = await prisma.staff.update({
      where: { id },
      data: { ...data, order },
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

export type MoveDirection = "up" | "down";

/**
 * เลื่อนบุคลากรขึ้น/ลง **ภายในกลุ่มของตัวเอง** (สลับกับคนที่อยู่ติดกัน)
 *
 * เขียนเลข `order` ใหม่ทั้งกลุ่มเป็น 0..n-1 ทุกครั้ง — normalize เลขซ้ำ/เลขที่ห่างเป็นหลุม
 * ที่ค้างมาจากตอนกรอกเลขมือทิ้งไปในตัว ไม่งั้นกดสลับกับคนที่เลขเท่ากันจะไม่ขยับ
 */
export async function moveStaff(id: string, direction: MoveDirection): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const target = await prisma.staff.findUnique({ where: { id }, select: { department: true } });
  if (!target) return { ok: false, error: "ไม่พบบุคลากรนี้" };

  try {
    // เรียงให้ตรงกับที่หน้าหลังบ้าน/หน้าเว็บเรนเดอร์ — รวมคนที่ซ่อนอยู่ด้วย เพราะตารางหลังบ้านก็แสดง
    const members = await prisma.staff.findMany({
      where: { department: target.department },
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true },
    });

    const index = members.findIndex((m) => m.id === id);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    // สุดขอบกลุ่มแล้ว — ปุ่มถูก disable ไว้อยู่แล้ว ถือว่าสำเร็จแบบไม่ต้องทำอะไร
    if (index < 0 || swapWith < 0 || swapWith >= members.length) return { ok: true, id };

    const reordered = [...members];
    [reordered[index], reordered[swapWith]] = [reordered[swapWith], reordered[index]];

    await prisma.$transaction(
      reordered.map((m, i) =>
        prisma.staff.update({ where: { id: m.id }, data: { order: i }, select: { id: true } }),
      ),
    );

    revalidateStaff();
    return { ok: true, id };
  } catch (error) {
    console.error("moveStaff failed:", error);
    return { ok: false, error: "เลื่อนลำดับไม่สำเร็จ กรุณาลองใหม่" };
  }
}

/**
 * เลื่อนลำดับ "กลุ่ม/ฝ่าย" ขึ้น/ลง
 *
 * ⚠️ สลับกับกลุ่มที่ **มีคนอยู่จริง** ตัวถัดไป ไม่ใช่แถวถัดไปใน DB — กลุ่มร้าง (เปลี่ยนชื่อฝ่ายแล้ว
 * แถวเดิมค้างอยู่) ไม่ถูกเรนเดอร์ ถ้านับรวมด้วยแอดมินจะกดแล้วเห็นว่า "ไม่ขยับ" หนึ่งครั้ง
 * กลุ่มร้างถูกดันไปต่อท้ายและเรียงเลขใหม่ให้ไม่ชนกัน
 */
export async function moveStaffDepartment(name: string, direction: MoveDirection): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  try {
    const [rows, used] = await Promise.all([
      prisma.staffDepartment.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }], select: { id: true, name: true } }),
      prisma.staff.groupBy({ by: ["department"], where: { department: { not: null } } }),
    ]);

    const usedNames = new Set(used.map((u) => u.department).filter((d): d is string => d !== null));
    const visible = rows.filter((r) => usedNames.has(r.name));
    const orphans = rows.filter((r) => !usedNames.has(r.name));

    const index = visible.findIndex((r) => r.name === name);
    if (index < 0) return { ok: false, error: "ไม่พบกลุ่มนี้" };

    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (swapWith < 0 || swapWith >= visible.length) return { ok: true, id: visible[index].id };

    [visible[index], visible[swapWith]] = [visible[swapWith], visible[index]];

    await prisma.$transaction(
      [...visible, ...orphans].map((r, i) =>
        prisma.staffDepartment.update({ where: { id: r.id }, data: { order: i }, select: { id: true } }),
      ),
    );

    revalidateStaff();
    return { ok: true, id: visible[swapWith].id };
  } catch (error) {
    console.error("moveStaffDepartment failed:", error);
    return { ok: false, error: "เลื่อนลำดับกลุ่มไม่สำเร็จ กรุณาลองใหม่" };
  }
}
