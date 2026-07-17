"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { TaxonomyDialog, type TaxonomyItem, type TaxonomyKind } from "@/components/admin/taxonomy-dialog";
import { deleteCategory, deleteTag } from "@/server/actions/taxonomy";

/**
 * บอกให้ชัดว่าลบแล้วข่าวจะเป็นยังไง — ข่าวไม่หายทั้งสองกรณี แต่คนละแบบ
 * หมวดหมู่: onDelete SetNull → ข่าวกลายเป็น "ไม่มีหมวดหมู่" · แท็ก: m-n → แค่ถูกถอดแท็กออก
 */
function deleteDescription(kind: TaxonomyKind, name: string, newsCount: number) {
  if (newsCount === 0) return `“${name}” จะถูกลบถาวร กู้คืนไม่ได้`;

  return kind === "category"
    ? `“${name}” จะถูกลบถาวร · ข่าว ${newsCount} ข่าวที่ใช้หมวดนี้จะไม่ถูกลบ แต่จะกลายเป็น “ไม่มีหมวดหมู่”`
    : `“${name}” จะถูกลบถาวร · ข่าว ${newsCount} ข่าวที่ติดแท็กนี้จะไม่ถูกลบ แต่จะถูกถอดแท็กออก`;
}

export function TaxonomyRowActions({
  kind,
  item,
  newsCount,
}: {
  kind: TaxonomyKind;
  item: TaxonomyItem;
  newsCount: number;
}) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function handleDelete() {
    const result = kind === "category" ? await deleteCategory(item.id) : await deleteTag(item.id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(kind === "category" ? "ลบหมวดหมู่แล้ว" : "ลบแท็กแล้ว");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setEditOpen(true)}
        aria-label={`แก้ไข ${item.name}`}
        title="แก้ไข"
      >
        <Pencil />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setConfirmOpen(true)}
        aria-label={`ลบ ${item.name}`}
        title="ลบ"
        className="text-destructive"
      >
        <Trash2 />
      </Button>

      <TaxonomyDialog kind={kind} item={item} open={editOpen} onOpenChange={setEditOpen} />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={kind === "category" ? "ลบหมวดหมู่นี้?" : "ลบแท็กนี้?"}
        description={deleteDescription(kind, item.name, newsCount)}
        confirmLabel={kind === "category" ? "ลบหมวดหมู่" : "ลบแท็ก"}
        onConfirm={handleDelete}
      />
    </div>
  );
}
