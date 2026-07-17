import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: "DRAFT" | "PUBLISHED" }) {
  return status === "PUBLISHED" ? (
    <Badge variant="default">เผยแพร่แล้ว</Badge>
  ) : (
    <Badge variant="secondary">ร่าง</Badge>
  );
}
