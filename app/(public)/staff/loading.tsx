import { Skeleton } from "@/components/ui/skeleton";
import { PageHeroSkeleton } from "@/components/public/list-skeleton";

/** โครงโหลดหน้าบุคลากร — segment นี้ไม่มีหน้า detail จึงวาง `loading.tsx` ได้โดยไม่กระทบสถานะ 404 */
export default function StaffLoading() {
  return (
    <>
      <PageHeroSkeleton />
      <div className="mx-auto max-w-[1200px] px-4 py-9 pb-16 sm:px-6">
        <Skeleton className="mb-5 h-6 w-40" />
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
              <Skeleton className="aspect-square rounded-none" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3.5 w-3/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
