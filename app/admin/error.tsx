"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Error boundary ของหลังบ้าน — อยู่ใต้ `admin/layout.tsx` จึงยังมีเมนู/กรอบ AdminShell ครบ
 * แอดมินเจอ error แล้วยังกดไปหน้าอื่นต่อได้ ไม่ต้องพิมพ์ URL ใหม่
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("admin route error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-16 text-center">
      <span className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-warning-muted text-warning-foreground">
        <TriangleAlert className="size-8" aria-hidden="true" />
      </span>
      <h2 className="text-xl font-semibold tracking-tight">เกิดข้อผิดพลาดในหน้านี้</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        ระบบทำงานผิดพลาดชั่วคราว ลองกดโหลดใหม่ · ถ้ายังไม่หายให้ดูรายละเอียดใน log ของเซิร์ฟเวอร์
      </p>
      {error.digest && (
        <p className="mt-2 text-xs text-muted-foreground/70">รหัสอ้างอิง: {error.digest}</p>
      )}
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button onClick={reset} className="font-semibold">
          <RotateCw className="size-4" aria-hidden="true" />
          ลองใหม่อีกครั้ง
        </Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/admin" />}>
          <Home className="size-4" aria-hidden="true" />
          กลับแดชบอร์ด
        </Button>
      </div>
    </div>
  );
}
