"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deleteDocument, toggleDocumentPublish } from "@/server/actions/document";

export function DocumentRowActions({
  id,
  title,
  status,
}: {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleDocumentPublish(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(status === "PUBLISHED" ? "เปลี่ยนเป็นร่างแล้ว" : "เผยแพร่แล้ว");
      router.refresh();
    });
  }

  async function handleDelete() {
    const result = await deleteDocument(id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("ลบเอกสารแล้ว");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={status === "PUBLISHED" ? "เปลี่ยนเป็นร่าง" : "เผยแพร่"}
        title={status === "PUBLISHED" ? "เปลี่ยนเป็นร่าง" : "เผยแพร่"}
      >
        {status === "PUBLISHED" ? <EyeOff /> : <Eye />}
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        nativeButton={false}
        render={<Link href={`/admin/documents/${id}/edit`} />}
        aria-label="แก้ไข"
        title="แก้ไข"
      >
        <Pencil />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setConfirmOpen(true)}
        aria-label="ลบ"
        title="ลบ"
        className="text-destructive"
      >
        <Trash2 />
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="ลบเอกสารนี้?"
        description={`“${title}” จะถูกลบถาวร กู้คืนไม่ได้ (ไฟล์บน Cloudinary/Drive ไม่ถูกลบ)`}
        confirmLabel="ลบเอกสาร"
        onConfirm={handleDelete}
      />
    </div>
  );
}
