import Link from "next/link";
import { FileQuestion, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 404 ของหลังบ้าน — เจอตอนเปิด `/admin/news/<id ที่ถูกลบไปแล้ว>/edit` เป็นต้น
 * (หน้า edit ทุกโมดูลเรียก `notFound()` เมื่อหา record ไม่เจอ)
 */
export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-16 text-center">
      <span className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-secondary text-primary">
        <FileQuestion className="size-8" aria-hidden="true" />
      </span>
      <h2 className="text-xl font-semibold tracking-tight">ไม่พบรายการนี้</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        รายการที่เปิดอาจถูกลบไปแล้ว หรือลิงก์ไม่ถูกต้อง
      </p>
      <Button className="mt-7 font-semibold" nativeButton={false} render={<Link href="/admin" />}>
        <Home className="size-4" aria-hidden="true" />
        กลับแดชบอร์ด
      </Button>
    </div>
  );
}
