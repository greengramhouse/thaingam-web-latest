import { Skeleton } from "@/components/ui/skeleton";
import { PageHeroSkeleton, RowsSkeleton } from "@/components/public/list-skeleton";

/** โครงโหลดศูนย์ดาวน์โหลด (`[id]/download` เป็น route handler ไม่ใช่หน้า จึงไม่โดน streaming) */
export default function DocumentsLoading() {
  return (
    <>
      <PageHeroSkeleton />
      <div className="mx-auto max-w-[900px] px-4 py-9 pb-16 sm:px-6">
        <Skeleton className="mb-4 h-6 w-32" />
        <RowsSkeleton count={4} />
      </div>
    </>
  );
}
