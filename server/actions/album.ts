"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isUniqueSlugError } from "@/lib/prisma-errors";
import { canManageContent, getCurrentUser } from "@/lib/rbac";
import { albumFormSchema, photoCaptionSchema } from "@/lib/validations/album";
import { parseEventDateInput } from "@/lib/event";
import type { ActionResult } from "@/server/actions/types";

async function requireContentManager() {
  const user = await getCurrentUser();
  if (!user || !canManageContent(user.role)) return null;
  return user;
}

function revalidateAlbums(slug?: string) {
  revalidatePath("/admin/albums");
  revalidatePath("/albums"); // หน้าอัลบั้มสาธารณะ (Phase 4.6)
  if (slug) revalidatePath(`/albums/${slug}`);
}

type Parsed = ReturnType<typeof albumFormSchema.parse>;

function toAlbumData(data: Parsed) {
  return {
    title: data.title,
    slug: data.slug,
    description: data.description || null,
    coverImage: data.coverImage || null,
    // วันที่ระดับวัน — เที่ยงคืนท้องถิ่นเหมือน event allDay (ไม่เพี้ยนข้าม timezone)
    eventDate: data.eventDate ? parseEventDateInput(data.eventDate, true) : null,
    status: data.status,
  };
}

// ========================= Album =========================

export async function createAlbum(input: unknown): Promise<ActionResult> {
  const user = await requireContentManager();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const parsed = albumFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const album = await prisma.album.create({
      data: { ...toAlbumData(parsed.data), authorId: user.id },
      select: { id: true, slug: true },
    });
    revalidateAlbums(album.slug);
    return { ok: true, id: album.id };
  } catch (error) {
    if (isUniqueSlugError(error)) {
      return { ok: false, error: "slug นี้ถูกใช้แล้ว", fieldErrors: { slug: ["slug นี้ถูกใช้แล้ว"] } };
    }
    console.error("createAlbum failed:", error);
    return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function updateAlbum(id: string, input: unknown): Promise<ActionResult> {
  const user = await requireContentManager();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const parsed = albumFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.album.findUnique({ where: { id }, select: { slug: true } });
  if (!existing) return { ok: false, error: "ไม่พบอัลบั้มนี้" };

  try {
    const album = await prisma.album.update({
      where: { id },
      data: toAlbumData(parsed.data),
      select: { id: true, slug: true },
    });
    revalidateAlbums(album.slug);
    if (existing.slug !== album.slug) revalidateAlbums(existing.slug);
    return { ok: true, id: album.id };
  } catch (error) {
    if (isUniqueSlugError(error)) {
      return { ok: false, error: "slug นี้ถูกใช้แล้ว", fieldErrors: { slug: ["slug นี้ถูกใช้แล้ว"] } };
    }
    console.error("updateAlbum failed:", error);
    return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function deleteAlbum(id: string): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  try {
    // รูปในอัลบั้มถูกลบตาม onDelete: Cascade
    const album = await prisma.album.delete({ where: { id }, select: { id: true, slug: true } });
    revalidateAlbums(album.slug);
    return { ok: true, id: album.id };
  } catch (error) {
    console.error("deleteAlbum failed:", error);
    return { ok: false, error: "ลบไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function toggleAlbumPublish(id: string): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const existing = await prisma.album.findUnique({ where: { id }, select: { status: true, slug: true } });
  if (!existing) return { ok: false, error: "ไม่พบอัลบั้มนี้" };

  const nextStatus = existing.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  try {
    const album = await prisma.album.update({ where: { id }, data: { status: nextStatus }, select: { id: true } });
    revalidateAlbums(existing.slug);
    return { ok: true, id: album.id };
  } catch (error) {
    console.error("toggleAlbumPublish failed:", error);
    return { ok: false, error: "เปลี่ยนสถานะไม่สำเร็จ กรุณาลองใหม่" };
  }
}

// ========================= Photo =========================

/** เพิ่มรูปหลายใบต่อท้ายอัลบั้ม — order ต่อจากรูปสุดท้าย (เลขไม่ซ้ำ เพื่อให้สลับลำดับได้แน่นอน) */
export async function addPhotos(albumId: string, urls: unknown): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  if (!Array.isArray(urls) || urls.some((u) => typeof u !== "string" || !u)) {
    return { ok: false, error: "ข้อมูลรูปไม่ถูกต้อง" };
  }
  const list = urls as string[];
  if (list.length === 0) return { ok: false, error: "ไม่มีรูปให้เพิ่ม" };

  const album = await prisma.album.findUnique({ where: { id: albumId }, select: { slug: true } });
  if (!album) return { ok: false, error: "ไม่พบอัลบั้มนี้" };

  try {
    const last = await prisma.photo.findFirst({
      where: { albumId },
      orderBy: { order: "desc" },
      select: { order: true },
    });
    let next = (last?.order ?? -1) + 1;
    await prisma.photo.createMany({
      data: list.map((url) => ({ albumId, url, order: next++ })),
    });
    revalidateAlbums(album.slug);
    return { ok: true, id: albumId };
  } catch (error) {
    console.error("addPhotos failed:", error);
    return { ok: false, error: "เพิ่มรูปไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function updatePhotoCaption(photoId: string, caption: unknown): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const parsed = photoCaptionSchema.safeParse(caption);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "คำบรรยายไม่ถูกต้อง" };

  const existing = await prisma.photo.findUnique({
    where: { id: photoId },
    select: { album: { select: { slug: true } } },
  });
  if (!existing) return { ok: false, error: "ไม่พบรูปนี้" };

  try {
    await prisma.photo.update({ where: { id: photoId }, data: { caption: parsed.data || null } });
    revalidateAlbums(existing.album.slug);
    return { ok: true, id: photoId };
  } catch (error) {
    console.error("updatePhotoCaption failed:", error);
    return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function deletePhoto(photoId: string): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const existing = await prisma.photo.findUnique({
    where: { id: photoId },
    select: { album: { select: { slug: true } } },
  });
  if (!existing) return { ok: false, error: "ไม่พบรูปนี้" };

  try {
    await prisma.photo.delete({ where: { id: photoId } });
    revalidateAlbums(existing.album.slug);
    return { ok: true, id: photoId };
  } catch (error) {
    console.error("deletePhoto failed:", error);
    return { ok: false, error: "ลบรูปไม่สำเร็จ กรุณาลองใหม่" };
  }
}

/** สลับลำดับรูปกับใบที่อยู่ติดกัน (ขึ้น/ลง) — swap ค่า order สองใบใน transaction */
export async function movePhoto(photoId: string, direction: unknown): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };
  if (direction !== "up" && direction !== "down") return { ok: false, error: "ทิศทางไม่ถูกต้อง" };

  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    select: { id: true, order: true, albumId: true, album: { select: { slug: true } } },
  });
  if (!photo) return { ok: false, error: "ไม่พบรูปนี้" };

  // หาใบข้างเคียง: up = order น้อยกว่าที่ใกล้สุด · down = order มากกว่าที่ใกล้สุด
  const neighbor = await prisma.photo.findFirst({
    where:
      direction === "up"
        ? { albumId: photo.albumId, order: { lt: photo.order } }
        : { albumId: photo.albumId, order: { gt: photo.order } },
    orderBy: { order: direction === "up" ? "desc" : "asc" },
    select: { id: true, order: true },
  });
  if (!neighbor) return { ok: true, id: photoId }; // สุดขอบแล้ว ไม่ต้องทำอะไร

  try {
    await prisma.$transaction([
      prisma.photo.update({ where: { id: photo.id }, data: { order: neighbor.order } }),
      prisma.photo.update({ where: { id: neighbor.id }, data: { order: photo.order } }),
    ]);
    revalidateAlbums(photo.album.slug);
    return { ok: true, id: photoId };
  } catch (error) {
    console.error("movePhoto failed:", error);
    return { ok: false, error: "สลับลำดับไม่สำเร็จ กรุณาลองใหม่" };
  }
}
