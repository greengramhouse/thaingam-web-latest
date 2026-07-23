"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hitRateLimit } from "@/lib/rate-limit";

/**
 * ไลก์อัลบั้มแบบไม่ต้องล็อกอิน — ระบุตัว visitor ด้วย cookie id (ตั้งครั้งแรกที่กดไลก์)
 * unique(albumId, fingerprint) กันไลก์ซ้ำจากเบราว์เซอร์เดิม · likeCount denormalized อัปเดตใน transaction
 * fingerprint แบบ cookie แม่นกว่า IP+UA (ไม่ชนกันในเน็ตเวิร์กเดียว) และใช้เป็นคีย์ rate limit ได้เลย
 */
const VISITOR_COOKIE = "visitor_id";
const ONE_YEAR = 60 * 60 * 24 * 365;
const LIKE_LIMIT = 20;
const LIKE_WINDOW_MS = 60 * 1000; // 20 ครั้ง / นาที / เบราว์เซอร์

async function getVisitorId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(VISITOR_COOKIE)?.value;
  if (existing) return existing;

  const id = crypto.randomUUID();
  store.set(VISITOR_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: ONE_YEAR,
    path: "/",
  });
  return id;
}

export type LikeResult = { liked: boolean; likeCount: number };

export async function toggleAlbumLike(albumId: string): Promise<LikeResult> {
  const album = await prisma.album.findFirst({
    where: { id: albumId, status: "PUBLISHED" },
    select: { likeCount: true },
  });
  if (!album) return { liked: false, likeCount: 0 };

  const fingerprint = await getVisitorId();
  const existing = await prisma.albumLike.findUnique({
    where: { albumId_fingerprint: { albumId, fingerprint } },
    select: { id: true },
  });

  // กันกดรัว/สคริปต์สลับไลก์ถี่ ๆ (แต่ละครั้งเป็น transaction 2 statement)
  // เกินโควตา → คืน "สถานะจริงในตอนนี้" ให้ UI optimistic เด้งกลับเอง ไม่ต้องมี error path ใหม่
  if (!hitRateLimit(`like:${fingerprint}`, LIKE_LIMIT, LIKE_WINDOW_MS).ok) {
    return { liked: !!existing, likeCount: Math.max(0, album.likeCount) };
  }

  try {
    if (existing) {
      const [, updated] = await prisma.$transaction([
        prisma.albumLike.delete({ where: { id: existing.id } }),
        prisma.album.update({
          where: { id: albumId },
          data: { likeCount: { decrement: 1 } },
          select: { likeCount: true },
        }),
      ]);
      return { liked: false, likeCount: Math.max(0, updated.likeCount) };
    }

    const [, updated] = await prisma.$transaction([
      prisma.albumLike.create({ data: { albumId, fingerprint } }),
      prisma.album.update({
        where: { id: albumId },
        data: { likeCount: { increment: 1 } },
        select: { likeCount: true },
      }),
    ]);
    return { liked: true, likeCount: updated.likeCount };
  } catch (error) {
    console.error("toggleAlbumLike failed:", error);
    return { liked: !!existing, likeCount: Math.max(0, album.likeCount) };
  }
}
