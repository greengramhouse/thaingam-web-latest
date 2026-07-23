"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isUniqueSlugError } from "@/lib/prisma-errors";
import { canManageContent, getCurrentUser } from "@/lib/rbac";
import { newsFormSchema } from "@/lib/validations/news";
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

function revalidateNews(slug?: string) {
  revalidatePath("/admin/news");
  revalidatePath("/news");
  revalidatePath("/"); // หน้าแรกมีบล็อกข่าว (Phase 4.5) — ไม่ revalidate = ข่าวใหม่ไม่ขึ้นหน้าแรก
  if (slug) revalidatePath(`/news/${slug}`);
}

export async function createNews(input: unknown): Promise<ActionResult> {
  const user = await requireContentManager();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const parsed = newsFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  try {
    const news = await prisma.news.create({
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        content: data.content,
        coverImage: data.coverImage || null,
        categoryId: data.categoryId || null,
        featured: data.featured,
        status: data.status,
        publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        authorId: user.id,
        tags: data.tagIds.length ? { connect: data.tagIds.map((id) => ({ id })) } : undefined,
      },
      select: { id: true, slug: true },
    });

    revalidateNews(news.slug);
    return { ok: true, id: news.id };
  } catch (error) {
    if (isUniqueSlugError(error)) {
      return { ok: false, error: "slug นี้ถูกใช้แล้ว", fieldErrors: { slug: ["slug นี้ถูกใช้แล้ว"] } };
    }
    console.error("createNews failed:", error);
    return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function updateNews(id: string, input: unknown): Promise<ActionResult> {
  const user = await requireContentManager();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const parsed = newsFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  const existing = await prisma.news.findUnique({
    where: { id },
    select: { publishedAt: true, slug: true },
  });
  if (!existing) return { ok: false, error: "ไม่พบข่าวนี้" };

  try {
    const news = await prisma.news.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt || null,
        content: data.content,
        coverImage: data.coverImage || null,
        categoryId: data.categoryId || null,
        featured: data.featured,
        status: data.status,
        // เผยแพร่ครั้งแรกเท่านั้นที่ตั้งเวลา — แก้ข่าวที่เผยแพร่แล้วไม่ดันวันที่ใหม่
        publishedAt: data.status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
        tags: { set: data.tagIds.map((tagId) => ({ id: tagId })) },
      },
      select: { id: true, slug: true },
    });

    revalidateNews(news.slug);
    if (existing.slug !== news.slug) revalidatePath(`/news/${existing.slug}`);
    return { ok: true, id: news.id };
  } catch (error) {
    if (isUniqueSlugError(error)) {
      return { ok: false, error: "slug นี้ถูกใช้แล้ว", fieldErrors: { slug: ["slug นี้ถูกใช้แล้ว"] } };
    }
    console.error("updateNews failed:", error);
    return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function deleteNews(id: string): Promise<ActionResult> {
  const user = await requireContentManager();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  try {
    const news = await prisma.news.delete({ where: { id }, select: { id: true, slug: true } });
    revalidateNews(news.slug);
    return { ok: true, id: news.id };
  } catch (error) {
    console.error("deleteNews failed:", error);
    return { ok: false, error: "ลบไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function toggleNewsPublish(id: string): Promise<ActionResult> {
  const user = await requireContentManager();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const existing = await prisma.news.findUnique({
    where: { id },
    select: { status: true, publishedAt: true },
  });
  if (!existing) return { ok: false, error: "ไม่พบข่าวนี้" };

  const nextStatus = existing.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";

  try {
    const news = await prisma.news.update({
      where: { id },
      data: {
        status: nextStatus,
        publishedAt: nextStatus === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
      },
      select: { id: true, slug: true },
    });
    revalidateNews(news.slug);
    return { ok: true, id: news.id };
  } catch (error) {
    console.error("toggleNewsPublish failed:", error);
    return { ok: false, error: "เปลี่ยนสถานะไม่สำเร็จ กรุณาลองใหม่" };
  }
}
