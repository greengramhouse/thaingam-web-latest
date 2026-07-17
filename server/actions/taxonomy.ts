"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isUniqueSlugError } from "@/lib/prisma-errors";
import { canManageContent, getCurrentUser } from "@/lib/rbac";
import { categoryFormSchema, tagFormSchema } from "@/lib/validations/taxonomy";
import type { ActionResult } from "@/server/actions/types";

/**
 * ทุก action ต้องเช็คสิทธิ์เองเสมอ — proxy.ts เช็คแค่ว่ามี cookie
 * และ Server Action ถูกเรียกตรงจาก client ได้ ไม่ได้ผ่าน layout guard
 */
async function requireContentManager() {
  const user = await getCurrentUser();
  if (!user || !canManageContent(user.role)) return null;
  return user;
}

/**
 * หมวดหมู่/แท็กโผล่บนหน้าข่าวด้วย (ชื่อ + ตัวกรอง) → แก้แล้วต้องล้าง cache หน้าข่าวด้วย
 * ไม่ใช่แค่หน้าจัดการ
 */
function revalidateTaxonomy() {
  revalidatePath("/admin/categories");
  revalidatePath("/admin/news");
  revalidatePath("/news");
}

const DUPLICATE_SLUG: ActionResult = {
  ok: false,
  error: "slug นี้ถูกใช้แล้ว",
  fieldErrors: { slug: ["slug นี้ถูกใช้แล้ว"] },
};

// ───────────────────────── Category ─────────────────────────

export async function createCategory(input: unknown): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const parsed = categoryFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  try {
    const category = await prisma.category.create({
      data: { name: data.name, slug: data.slug, description: data.description || null },
      select: { id: true },
    });
    revalidateTaxonomy();
    return { ok: true, id: category.id };
  } catch (error) {
    if (isUniqueSlugError(error)) return DUPLICATE_SLUG;
    console.error("createCategory failed:", error);
    return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function updateCategory(id: string, input: unknown): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const parsed = categoryFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  try {
    const category = await prisma.category.update({
      where: { id },
      data: { name: data.name, slug: data.slug, description: data.description || null },
      select: { id: true },
    });
    revalidateTaxonomy();
    return { ok: true, id: category.id };
  } catch (error) {
    if (isUniqueSlugError(error)) return DUPLICATE_SLUG;
    console.error("updateCategory failed:", error);
    return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
}

/** ลบหมวดหมู่ — ข่าวที่ใช้อยู่ไม่หาย แต่ categoryId ถูกคืนเป็น null (onDelete: SetNull) */
export async function deleteCategory(id: string): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  try {
    const category = await prisma.category.delete({ where: { id }, select: { id: true } });
    revalidateTaxonomy();
    return { ok: true, id: category.id };
  } catch (error) {
    console.error("deleteCategory failed:", error);
    return { ok: false, error: "ลบไม่สำเร็จ กรุณาลองใหม่" };
  }
}

// ─────────────────────────── Tag ────────────────────────────

export async function createTag(input: unknown): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const parsed = tagFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  try {
    const tag = await prisma.tag.create({ data: { name: data.name, slug: data.slug }, select: { id: true } });
    revalidateTaxonomy();
    return { ok: true, id: tag.id };
  } catch (error) {
    if (isUniqueSlugError(error)) return DUPLICATE_SLUG;
    console.error("createTag failed:", error);
    return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function updateTag(id: string, input: unknown): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const parsed = tagFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  try {
    const tag = await prisma.tag.update({
      where: { id },
      data: { name: data.name, slug: data.slug },
      select: { id: true },
    });
    revalidateTaxonomy();
    return { ok: true, id: tag.id };
  } catch (error) {
    if (isUniqueSlugError(error)) return DUPLICATE_SLUG;
    console.error("updateTag failed:", error);
    return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
}

/** ลบแท็ก — ข่าวไม่หาย แค่ถูกถอดแท็กออก (m-n ตัดแถวใน join table ให้เอง) */
export async function deleteTag(id: string): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  try {
    const tag = await prisma.tag.delete({ where: { id }, select: { id: true } });
    revalidateTaxonomy();
    return { ok: true, id: tag.id };
  } catch (error) {
    console.error("deleteTag failed:", error);
    return { ok: false, error: "ลบไม่สำเร็จ กรุณาลองใหม่" };
  }
}
