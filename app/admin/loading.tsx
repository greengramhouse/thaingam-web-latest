import { Skeleton } from "@/components/ui/skeleton";

/**
 * โครงโหลดของหลังบ้าน — ทรงเดียวกับหน้าลิสต์ (หัวเรื่อง + แถบค้นหา + ตาราง)
 * ซึ่งเป็นหน้าส่วนใหญ่ของ `/admin/*`
 */
export default function AdminLoading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">กำลังโหลด…</span>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <Skeleton className="h-7 w-44" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <Skeleton className="h-9 w-full max-w-xs" />
        <Skeleton className="h-9 w-28" />
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <Skeleton className="h-11 rounded-none" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-t border-border px-4 py-3.5">
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="size-8 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
