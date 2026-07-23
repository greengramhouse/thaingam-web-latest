import { Skeleton } from "@/components/ui/skeleton";
import { PageHeroSkeleton } from "@/components/public/list-skeleton";

/** โครงโหลดหน้าเกี่ยวกับเรา */
export default function AboutLoading() {
  return (
    <>
      <PageHeroSkeleton />
      <div className="mx-auto max-w-[1000px] space-y-8 px-4 py-9 pb-16 sm:px-6">
        <Skeleton className="h-24 rounded-2xl" />
        <div className="grid gap-5 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-2xl" />
          ))}
        </div>
      </div>
    </>
  );
}
