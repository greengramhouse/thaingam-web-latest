import Link from "next/link";
import { Compass, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 404 ระดับราก — ครอบ URL ที่ไม่ตรงกับ segment ไหนเลย (เช่น `/admin/มั่ว/มั่ว`)
 * URL ชั้นเดียวจะไปเข้า `(public)/[slug]` แล้วใช้ 404 ของฝั่ง public (มี Header/Footer) แทน
 * ที่นี่ไม่มีเลย์เอาต์สาธารณะครอบ จึงใส่ปุ่มกลับหน้าแรกให้ชัด
 */
export default function RootNotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <span className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-secondary text-primary">
        <Compass className="size-9" aria-hidden="true" />
      </span>
      <p className="text-[13px] font-semibold tracking-[0.2em] text-muted-foreground">404</p>
      <h1 className="mt-2 text-[28px] font-bold tracking-tight">ไม่พบหน้าที่คุณเปิด</h1>
      <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
        ที่อยู่นี้อาจพิมพ์ผิด หรือหน้านั้นถูกย้ายไปแล้ว
      </p>
      <Button className="mt-8 font-semibold" nativeButton={false} render={<Link href="/" />}>
        <Home className="size-4" aria-hidden="true" />
        กลับหน้าแรก
      </Button>
    </div>
  );
}
