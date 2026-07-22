import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** สร้าง URL หน้าใหม่โดยคงพารามิเตอร์อื่น (q, category) ไว้ */
function pageHref(basePath: string, params: Record<string, string | undefined>, page: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  if (page > 1) search.set("page", String(page));
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** ช่วงเลขหน้าแบบย่อ (มี … เมื่อหน้าเยอะ) เช่น 1 … 4 5 6 … 12 */
function pageWindow(page: number, pageCount: number): (number | "…")[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(pageCount - 1, page + 1);
  if (start > 2) out.push("…");
  for (let n = start; n <= end; n++) out.push(n);
  if (end < pageCount - 1) out.push("…");
  out.push(pageCount);
  return out;
}

const cellBase =
  "flex size-[38px] items-center justify-center rounded-[9px] border border-border bg-card text-sm text-foreground transition-colors hover:bg-accent";

/** เลขหน้าแบบ public ตาม mockup — ปุ่มลูกศร + เลขหน้า (หน้าปัจจุบันพื้นคราม) */
export function PublicPagination({
  basePath,
  params,
  page,
  pageCount,
}: {
  basePath: string;
  params: Record<string, string | undefined>;
  page: number;
  pageCount: number;
}) {
  if (pageCount <= 1) return null;

  return (
    <nav className="mt-9 flex items-center justify-center gap-1.5" aria-label="แบ่งหน้า">
      {page > 1 ? (
        <Link href={pageHref(basePath, params, page - 1)} className={cn(cellBase, "text-muted-foreground")} aria-label="หน้าก่อนหน้า">
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className={cn(cellBase, "cursor-not-allowed text-muted-foreground/40")} aria-hidden="true">
          <ChevronLeft className="size-4" />
        </span>
      )}

      {pageWindow(page, pageCount).map((n, i) =>
        n === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-sm text-muted-foreground">
            …
          </span>
        ) : n === page ? (
          <span
            key={n}
            aria-current="page"
            className="flex size-[38px] items-center justify-center rounded-[9px] bg-primary text-sm font-semibold text-primary-foreground"
          >
            {n}
          </span>
        ) : (
          <Link key={n} href={pageHref(basePath, params, n)} className={cellBase}>
            {n}
          </Link>
        ),
      )}

      {page < pageCount ? (
        <Link href={pageHref(basePath, params, page + 1)} className={cn(cellBase, "text-muted-foreground")} aria-label="หน้าถัดไป">
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span className={cn(cellBase, "cursor-not-allowed text-muted-foreground/40")} aria-hidden="true">
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
