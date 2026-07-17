import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/** สร้าง URL หน้าใหม่โดยคงพารามิเตอร์อื่น (q, filter) ไว้ */
function pageHref(basePath: string, params: Record<string, string | undefined>, page: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function TablePagination({
  basePath,
  params,
  page,
  pageCount,
  total,
}: {
  basePath: string;
  params: Record<string, string | undefined>;
  page: number;
  pageCount: number;
  total: number;
}) {
  if (pageCount <= 1) {
    return <p className="text-sm text-muted-foreground">ทั้งหมด {total} รายการ</p>;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-muted-foreground">
        ทั้งหมด {total} รายการ — หน้า {page}/{pageCount}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={page <= 1}
          nativeButton={false}
          render={page <= 1 ? <span /> : <Link href={pageHref(basePath, params, page - 1)} />}
        >
          <ChevronLeft aria-hidden="true" />
          ก่อนหน้า
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount}
          nativeButton={false}
          render={page >= pageCount ? <span /> : <Link href={pageHref(basePath, params, page + 1)} />}
        >
          ถัดไป
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
