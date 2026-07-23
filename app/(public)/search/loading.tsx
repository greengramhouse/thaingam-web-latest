import { Skeleton } from "@/components/ui/skeleton";
import { PageHeroSkeleton, RowsSkeleton } from "@/components/public/list-skeleton";

/** โครงโหลดหน้าค้นหา */
export default function SearchLoading() {
  return (
    <>
      <PageHeroSkeleton />
      <div className="mx-auto max-w-[820px] px-4 pb-20 sm:px-6">
        <Skeleton className="-mt-7 h-[88px] rounded-2xl" />
        <div className="mt-7 mb-5 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-28 rounded-full" />
          ))}
        </div>
        <RowsSkeleton count={4} />
      </div>
    </>
  );
}
