import { Skeleton } from "@/components/ui/skeleton";
import { PageHeroSkeleton } from "@/components/public/list-skeleton";

/** โครงโหลดหน้าปฏิทิน — ตัว FullCalendar เองโหลดแบบ dynamic (ssr:false) มี skeleton ของมันอีกชั้น */
export default function CalendarLoading() {
  return (
    <>
      <PageHeroSkeleton />
      <div className="mx-auto max-w-[1100px] px-4 py-9 pb-16 sm:px-6">
        <Skeleton className="h-[560px] rounded-2xl" />
      </div>
    </>
  );
}
