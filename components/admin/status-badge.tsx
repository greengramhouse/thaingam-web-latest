import { cn } from "@/lib/utils";

/**
 * ป้ายสถานะเผยแพร่ — ตาม DESIGN.md §4 (pill + จุดสีนำหน้า)
 * เผยแพร่ = มิ้นต์ · ร่าง = เหลือง warning
 */
export function StatusBadge({ status }: { status: "DRAFT" | "PUBLISHED" }) {
  const published = status === "PUBLISHED";

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        published
          ? "bg-mint-muted text-mint-foreground"
          : "bg-warning-muted text-warning-foreground",
      )}
    >
      <span
        className={cn("size-1.5 shrink-0 rounded-full", published ? "bg-mint" : "bg-warning")}
        aria-hidden="true"
      />
      {published ? "เผยแพร่แล้ว" : "ร่าง"}
    </span>
  );
}
