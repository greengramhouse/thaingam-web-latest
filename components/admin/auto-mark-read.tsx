"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { setMessageRead } from "@/server/actions/contact-message";

/**
 * ทำเครื่องหมาย "อ่านแล้ว" อัตโนมัติเมื่อ**เปิดหน้ารายละเอียดจริง** (ไม่ใช่ตอน prefetch)
 * — จงใจทำใน useEffect ฝั่ง client ไม่ใช่ตอน render ของ server component
 *   เพราะ Next prefetch <Link> ตอน hover → ถ้า mark ตอน render จะกลายเป็นอ่านแล้วทั้งที่ยังไม่เปิด
 */
export function AutoMarkRead({ id, isRead }: { id: string; isRead: boolean }) {
  const router = useRouter();
  const done = useRef(false);

  useEffect(() => {
    if (isRead || done.current) return;
    done.current = true;
    setMessageRead(id, true).then((result) => {
      if (result.ok) router.refresh(); // อัปเดตตัวนับ/สถานะในลิสต์เมื่อกดย้อนกลับ
    });
  }, [id, isRead, router]);

  return null;
}
