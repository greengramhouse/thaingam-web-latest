import { Skeleton } from "@/components/ui/skeleton";
import { PageHeroSkeleton } from "@/components/public/list-skeleton";

/** โครงโหลดหน้าติดต่อเรา (ข้อมูลติดต่อ + แผนที่ + ฟอร์ม) */
export default function ContactLoading() {
  return (
    <>
      <PageHeroSkeleton />
      <div className="mx-auto grid max-w-[1100px] gap-8 px-4 py-9 pb-16 sm:px-6 lg:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-40 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <Skeleton className="h-[420px] rounded-2xl" />
      </div>
    </>
  );
}
