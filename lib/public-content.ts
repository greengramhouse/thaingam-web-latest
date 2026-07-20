import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * ประกาศด่วนที่ "กำลังแสดง" ตอนนี้ — isActive และอยู่ในช่วงเวลา (startsAt/endsAt)
 * ใช้ในแถบประกาศบนสุดของทุกหน้า public (อยู่ใน layout) → cache ต่อ request
 */
export const getActiveAnnouncements = cache(async () => {
  const now = new Date();
  return prisma.announcement.findMany({
    where: {
      isActive: true,
      AND: [
        { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
        { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, message: true, linkUrl: true },
  });
});
