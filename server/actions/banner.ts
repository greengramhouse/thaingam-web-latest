"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { canManageContent, getCurrentUser } from "@/lib/rbac";
import { bannerFormSchema } from "@/lib/validations/banner";
import type { ActionResult } from "@/server/actions/types";

async function requireContentManager() {
  const user = await getCurrentUser();
  if (!user || !canManageContent(user.role)) return null;
  return user;
}

function revalidateBanners() {
  revalidatePath("/admin/banners");
  revalidatePath("/"); // Hero slider หน้าแรก (Phase 4.5)
}

type Parsed = ReturnType<typeof bannerFormSchema.parse>;

/** แปลง field ของฟอร์ม (string + ค่าว่าง) → รูปที่บันทึกลง DB · order string → number */
function toBannerData(data: Parsed) {
  return {
    title: data.title?.trim() || null,
    image: data.image,
    linkUrl: data.linkUrl || null,
    order: Number(data.order),
    isActive: data.isActive,
  };
}

export async function createBanner(input: unknown): Promise<ActionResult> {
  const user = await requireContentManager();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const parsed = bannerFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const banner = await prisma.banner.create({ data: toBannerData(parsed.data), select: { id: true } });
    revalidateBanners();
    return { ok: true, id: banner.id };
  } catch (error) {
    console.error("createBanner failed:", error);
    return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function updateBanner(id: string, input: unknown): Promise<ActionResult> {
  const user = await requireContentManager();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const parsed = bannerFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.banner.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return { ok: false, error: "ไม่พบแบนเนอร์นี้" };

  try {
    const banner = await prisma.banner.update({
      where: { id },
      data: toBannerData(parsed.data),
      select: { id: true },
    });
    revalidateBanners();
    return { ok: true, id: banner.id };
  } catch (error) {
    console.error("updateBanner failed:", error);
    return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function deleteBanner(id: string): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  try {
    const banner = await prisma.banner.delete({ where: { id }, select: { id: true } });
    revalidateBanners();
    return { ok: true, id: banner.id };
  } catch (error) {
    console.error("deleteBanner failed:", error);
    return { ok: false, error: "ลบไม่สำเร็จ กรุณาลองใหม่" };
  }
}

/** สลับแสดง/ซ่อนบนสไลด์หน้าแรก (isActive) */
export async function toggleBannerActive(id: string): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const existing = await prisma.banner.findUnique({ where: { id }, select: { isActive: true } });
  if (!existing) return { ok: false, error: "ไม่พบแบนเนอร์นี้" };

  try {
    const banner = await prisma.banner.update({
      where: { id },
      data: { isActive: !existing.isActive },
      select: { id: true },
    });
    revalidateBanners();
    return { ok: true, id: banner.id };
  } catch (error) {
    console.error("toggleBannerActive failed:", error);
    return { ok: false, error: "เปลี่ยนสถานะไม่สำเร็จ กรุณาลองใหม่" };
  }
}
