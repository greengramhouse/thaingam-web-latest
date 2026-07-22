import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

/**
 * ปุ่มดาวน์โหลด → นับ downloadCount **ตอนคลิกจริง** แล้ว redirect ไปไฟล์ (Cloudinary)
 *
 * ทำเป็น route handler + ลิงก์เป็น `<a>` ธรรมดา (ไม่ใช่ `<Link>`) จงใจ:
 *  - นับตอนโหลดไฟล์จริง ไม่ใช่ตอนเปิดหน้า list (แม่นกว่า)
 *  - `<Link>` prefetch อาจยิง route ตอน hover → นับเกิน (บทเรียนเดียวกับ mark-read 4.4.12)
 *  - หน้า `/documents` ยัง cacheable ได้ (การนับแยกออกมา)
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const doc = await prisma.document.findFirst({
    where: { id, status: "PUBLISHED" },
    select: { fileUrl: true },
  });
  if (!doc) notFound();

  // นับแบบ fire-and-forget — ล้มแล้วก็ยังให้ดาวน์โหลดได้
  try {
    await prisma.document.update({ where: { id }, data: { downloadCount: { increment: 1 } } });
  } catch {
    // เงียบไว้
  }

  redirect(doc.fileUrl);
}
