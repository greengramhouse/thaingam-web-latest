"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Error boundary ของเว็บสาธารณะ — กันจอขาวเวลาหน้าไหน throw (เช่น DB ล่มชั่วคราว)
 * ต้องเป็น Client Component เสมอ (React error boundary ทำงานฝั่ง client)
 *
 * ⚠️ **ห้ามโชว์ `error.message` ให้ผู้เข้าชม** — prod message จะถูกปิดไว้อยู่แล้ว
 * แต่ถ้าเผลอโชว์ตอน dev จะกลายเป็นรั่วโครงสร้าง DB/พาธไฟล์ · โชว์แค่ `digest` ไว้อ้างอิงตอนไล่ log
 */
export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("public route error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-[720px] flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-warning-muted text-warning-foreground">
        <TriangleAlert className="size-9" aria-hidden="true" />
      </span>
      <h1 className="text-[26px] font-bold tracking-tight sm:text-[30px]">เกิดข้อผิดพลาด</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
        ระบบขัดข้องชั่วคราว กรุณาลองโหลดหน้านี้ใหม่อีกครั้ง
        <br className="hidden sm:block" />
        หากยังไม่หาย โปรดแจ้งผู้ดูแลระบบของโรงเรียน
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-muted-foreground/70">รหัสอ้างอิง: {error.digest}</p>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button onClick={reset} className="font-semibold">
          <RotateCw className="size-4" aria-hidden="true" />
          ลองใหม่อีกครั้ง
        </Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/" />}>
          <Home className="size-4" aria-hidden="true" />
          กลับหน้าแรก
        </Button>
      </div>
    </div>
  );
}
