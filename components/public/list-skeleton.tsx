import { Skeleton } from "@/components/ui/skeleton";

/**
 * โครงโหลดของหน้าลิสต์สาธารณะ (ข่าว/ผลงาน/อัลบั้ม/เอกสาร…)
 *
 * ⚠️ **ทำไมไม่ทำเป็น `loading.tsx` ครอบทั้ง route group:**
 * ไฟล์ `loading.tsx` ทำให้ response ของ**ทุกหน้าใต้ segment นั้น**กลายเป็น streaming
 * → หน้าที่เรียก `notFound()` (slug ผิด/ยังเป็นร่าง) **ตอบ HTTP 200 แทน 404** เพราะส่ง header ไปแล้วแก้ไม่ได้
 * (Next ใส่ `<meta name="robots" content="noindex">` ให้แทน = soft 404 · วัดจริงแล้วทั้งสองแบบ)
 * → เว็บนี้เลือก **คง 404 จริงไว้** แล้ววาง skeleton เป็นราย segment / ใน `<Suspense>` ของหน้าลิสต์แทน
 * ดู problems.md 5.12
 */
export function ListSkeleton({
  count = 6,
  ratio = "aspect-[16/9]",
  columns = "sm:grid-cols-2 lg:grid-cols-3",
}: {
  count?: number;
  ratio?: string;
  columns?: string;
}) {
  return (
    <div className={`grid gap-[22px] ${columns}`} aria-busy="true" aria-live="polite">
      <span className="sr-only">กำลังโหลด…</span>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
          <Skeleton className={`${ratio} rounded-none`} />
          <div className="flex flex-col gap-2.5 p-[18px]">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** โครงโหลดแบบแถว (บุคลากร/เอกสาร/ผลค้นหา) */
export function RowsSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">กำลังโหลด…</span>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
          <Skeleton className="size-11 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3.5 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** แถบหัวเรื่องไล่เฉด (ทรงเดียวกับ PageHero) — ใช้ใน `loading.tsx` ของ segment ที่ไม่มีหน้า detail */
export function PageHeroSkeleton() {
  return (
    <div className="bg-gradient-to-br from-[#3B4680] to-primary">
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-11">
        <Skeleton className="h-3.5 w-28 bg-white/25" />
        <Skeleton className="mt-3 h-8 w-64 bg-white/30 sm:h-9" />
        <Skeleton className="mt-3 h-4 w-full max-w-md bg-white/20" />
      </div>
    </div>
  );
}
