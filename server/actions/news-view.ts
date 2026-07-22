"use server";

import { prisma } from "@/lib/prisma";

/**
 * เพิ่มยอดวิวข่าว — เรียกจาก client (useEffect) หลังหน้าโหลดจริง ไม่ใช่ตอน render
 *
 * ทำไมแยกออกมาเป็น action ยิงทีหลัง แทนที่จะ `viewCount++` ใน RSC:
 *  - การเขียน DB ทุก render ทำให้หน้า **cache ไม่ได้** (Phase 4.8 จะเปิด cache หน้า public)
 *  - แยกเป็น action ฝั่ง client → หน้ารายละเอียดยังเป็น static/cacheable ได้ ส่วนการนับเป็น side-effect เบา ๆ
 *  - ไม่ revalidate อะไร (เลขวิวไม่ต้องอัปเดตทันทีบนจอ + กัน revalidate ลูป)
 *
 * ไม่ต้องเช็คสิทธิ์ — เป็น action สาธารณะ (rate-limit ไว้พิจารณาที่ Phase 4.8)
 */
export async function incrementNewsView(id: string): Promise<void> {
  if (!id) return;
  try {
    await prisma.news.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  } catch {
    // ข่าวถูกลบ/ไม่มีอยู่ — เงียบไว้ ไม่ให้ล้มหน้า
  }
}
