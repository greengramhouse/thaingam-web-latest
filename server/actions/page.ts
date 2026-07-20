"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isUniqueSlugError } from "@/lib/prisma-errors";
import { canManageContent, getCurrentUser } from "@/lib/rbac";
import { pageFormSchema } from "@/lib/validations/page";
import type { ActionResult } from "@/server/actions/types";

async function requireContentManager() {
  const user = await getCurrentUser();
  if (!user || !canManageContent(user.role)) return null;
  return user;
}

function revalidatePage(slug?: string) {
  revalidatePath("/admin/pages");
  if (slug) revalidatePath(`/${slug}`); // หน้า public /[slug] (Phase 4.6)
}

export async function createPage(input: unknown): Promise<ActionResult> {
  const user = await requireContentManager();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const parsed = pageFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  try {
    const page = await prisma.page.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        status: data.status,
        authorId: user.id,
      },
      select: { id: true, slug: true },
    });
    revalidatePage(page.slug);
    return { ok: true, id: page.id };
  } catch (error) {
    if (isUniqueSlugError(error)) {
      return { ok: false, error: "slug นี้ถูกใช้แล้ว", fieldErrors: { slug: ["slug นี้ถูกใช้แล้ว"] } };
    }
    console.error("createPage failed:", error);
    return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function updatePage(id: string, input: unknown): Promise<ActionResult> {
  const user = await requireContentManager();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const parsed = pageFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  const existing = await prisma.page.findUnique({ where: { id }, select: { slug: true } });
  if (!existing) return { ok: false, error: "ไม่พบหน้านี้" };

  try {
    const page = await prisma.page.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        status: data.status,
      },
      select: { id: true, slug: true },
    });
    revalidatePage(page.slug);
    if (existing.slug !== page.slug) revalidatePath(`/${existing.slug}`);
    return { ok: true, id: page.id };
  } catch (error) {
    if (isUniqueSlugError(error)) {
      return { ok: false, error: "slug นี้ถูกใช้แล้ว", fieldErrors: { slug: ["slug นี้ถูกใช้แล้ว"] } };
    }
    console.error("updatePage failed:", error);
    return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function deletePage(id: string): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  try {
    const page = await prisma.page.delete({ where: { id }, select: { id: true, slug: true } });
    revalidatePage(page.slug);
    return { ok: true, id: page.id };
  } catch (error) {
    console.error("deletePage failed:", error);
    return { ok: false, error: "ลบไม่สำเร็จ กรุณาลองใหม่" };
  }
}

/** สลับเผยแพร่/ร่าง (status) */
export async function togglePagePublish(id: string): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const existing = await prisma.page.findUnique({ where: { id }, select: { status: true } });
  if (!existing) return { ok: false, error: "ไม่พบหน้านี้" };

  try {
    const page = await prisma.page.update({
      where: { id },
      data: { status: existing.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" },
      select: { id: true, slug: true },
    });
    revalidatePage(page.slug);
    return { ok: true, id: page.id };
  } catch (error) {
    console.error("togglePagePublish failed:", error);
    return { ok: false, error: "เปลี่ยนสถานะไม่สำเร็จ กรุณาลองใหม่" };
  }
}
