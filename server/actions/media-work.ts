"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isUniqueSlugError } from "@/lib/prisma-errors";
import { canManageContent, getCurrentUser } from "@/lib/rbac";
import { mediaWorkFormSchema } from "@/lib/validations/media-work";
import type { ActionResult } from "@/server/actions/types";

async function requireContentManager() {
  const user = await getCurrentUser();
  if (!user || !canManageContent(user.role)) return null;
  return user;
}

function revalidateWorks(slug?: string) {
  revalidatePath("/admin/works");
  revalidatePath("/works");
  revalidatePath("/"); // หน้าแรกมีบล็อกผลงาน/สื่อ (Phase 4.5)
  if (slug) revalidatePath(`/works/${slug}`);
}

type Parsed = ReturnType<typeof mediaWorkFormSchema.parse>;

/**
 * เก็บเฉพาะ field ของชนิดที่เลือก — อีก 2 ตัวล้างเป็น null
 *
 * ถ้าไม่ล้าง: สร้างเป็น YOUTUBE ใส่ลิงก์ไว้ → แก้เป็น ARTICLE → DB จะมีทั้ง youtubeUrl เก่า
 * และ content ใหม่ค้างอยู่พร้อมกัน แล้วหน้า public จะเดาไม่ออกว่าต้องแสดงอะไร
 */
function pickTypeFields(data: Parsed) {
  return {
    youtubeUrl: data.type === "YOUTUBE" ? (data.youtubeUrl ?? null) : null,
    videoUrl: data.type === "VIDEO" ? (data.videoUrl ?? null) : null,
    content: data.type === "ARTICLE" ? (data.content ?? null) : null,
  };
}

/**
 * 🐛 **อย่าเก็บรูปปกที่ derive จาก YouTube ลง DB** — `thumbnail` เก็บเฉพาะที่แอดมินตั้งเอง
 *    รูปปกอัตโนมัติของคลิปคำนวณตอนแสดงผลผ่าน `mediaWorkThumbnail()` ใน `lib/media-work.ts`
 *    เหตุผล + บั๊กที่เคยเกิด อยู่ในคอมเมนต์ของฟังก์ชันนั้น
 */
function cleanThumbnail(data: Parsed) {
  return data.thumbnail || null;
}

export async function createMediaWork(input: unknown): Promise<ActionResult> {
  const user = await requireContentManager();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const parsed = mediaWorkFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  try {
    const work = await prisma.mediaWork.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        type: data.type,
        ...pickTypeFields(data),
        thumbnail: cleanThumbnail(data),
        featured: data.featured,
        status: data.status,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        authorId: user.id,
        tags: data.tagIds.length ? { connect: data.tagIds.map((id) => ({ id })) } : undefined,
      },
      select: { id: true, slug: true },
    });

    revalidateWorks(work.slug);
    return { ok: true, id: work.id };
  } catch (error) {
    if (isUniqueSlugError(error)) {
      return { ok: false, error: "slug นี้ถูกใช้แล้ว", fieldErrors: { slug: ["slug นี้ถูกใช้แล้ว"] } };
    }
    console.error("createMediaWork failed:", error);
    return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function updateMediaWork(id: string, input: unknown): Promise<ActionResult> {
  const user = await requireContentManager();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const parsed = mediaWorkFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  const existing = await prisma.mediaWork.findUnique({
    where: { id },
    select: { publishedAt: true, slug: true },
  });
  if (!existing) return { ok: false, error: "ไม่พบผลงานนี้" };

  try {
    const work = await prisma.mediaWork.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description || null,
        type: data.type,
        ...pickTypeFields(data),
        thumbnail: cleanThumbnail(data),
        featured: data.featured,
        status: data.status,
        // เผยแพร่ครั้งแรกเท่านั้นที่ตั้งเวลา — แก้ของเก่าไม่ดันวันที่ใหม่ (เหมือน News)
        publishedAt: data.status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
        tags: { set: data.tagIds.map((tagId) => ({ id: tagId })) },
      },
      select: { id: true, slug: true },
    });

    revalidateWorks(work.slug);
    if (existing.slug !== work.slug) revalidatePath(`/works/${existing.slug}`);
    return { ok: true, id: work.id };
  } catch (error) {
    if (isUniqueSlugError(error)) {
      return { ok: false, error: "slug นี้ถูกใช้แล้ว", fieldErrors: { slug: ["slug นี้ถูกใช้แล้ว"] } };
    }
    console.error("updateMediaWork failed:", error);
    return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function deleteMediaWork(id: string): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  try {
    const work = await prisma.mediaWork.delete({ where: { id }, select: { id: true, slug: true } });
    revalidateWorks(work.slug);
    return { ok: true, id: work.id };
  } catch (error) {
    console.error("deleteMediaWork failed:", error);
    return { ok: false, error: "ลบไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function toggleMediaWorkPublish(id: string): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const existing = await prisma.mediaWork.findUnique({
    where: { id },
    select: { status: true, publishedAt: true },
  });
  if (!existing) return { ok: false, error: "ไม่พบผลงานนี้" };

  const nextStatus = existing.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

  try {
    const work = await prisma.mediaWork.update({
      where: { id },
      data: {
        status: nextStatus,
        publishedAt: nextStatus === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
      },
      select: { id: true, slug: true },
    });
    revalidateWorks(work.slug);
    return { ok: true, id: work.id };
  } catch (error) {
    console.error("toggleMediaWorkPublish failed:", error);
    return { ok: false, error: "เปลี่ยนสถานะไม่สำเร็จ กรุณาลองใหม่" };
  }
}
