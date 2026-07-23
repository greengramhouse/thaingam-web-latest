import Link from "next/link";
import { Compass, Home, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * 404 ของเว็บสาธารณะ — เรนเดอร์ในเลย์เอาต์ public (มี Header/Footer ครบ)
 * ครอบทั้ง URL ที่ไม่มีจริง และ `notFound()` จากหน้า detail (slug ผิด/ยังเป็นร่าง)
 */
export default function PublicNotFound() {
  return (
    <div className="mx-auto flex max-w-[720px] flex-col items-center px-4 py-24 text-center sm:px-6">
      <span className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-secondary text-primary">
        <Compass className="size-9" aria-hidden="true" />
      </span>
      <p className="text-[13px] font-semibold tracking-[0.2em] text-muted-foreground">404</p>
      <h1 className="mt-2 text-[28px] font-bold tracking-tight sm:text-[32px]">ไม่พบหน้าที่คุณเปิด</h1>
      <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
        หน้านี้อาจถูกย้าย ลบไปแล้ว หรือยังไม่ได้เผยแพร่
        <br className="hidden sm:block" />
        ลองกลับไปหน้าแรก หรือดูข่าวสารล่าสุดของโรงเรียน
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button nativeButton={false} render={<Link href="/" />} className="font-semibold">
          <Home className="size-4" aria-hidden="true" />
          กลับหน้าแรก
        </Button>
        <Button variant="outline" nativeButton={false} render={<Link href="/news" />}>
          <Newspaper className="size-4" aria-hidden="true" />
          ดูข่าวสาร
        </Button>
      </div>
    </div>
  );
}
