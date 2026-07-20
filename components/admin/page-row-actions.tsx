"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deletePage, togglePagePublish } from "@/server/actions/page";

export function PageRowActions({
  id,
  label,
  published,
}: {
  id: string;
  label: string;
  published: boolean;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const result = await togglePagePublish(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(published ? "เปลี่ยนเป็นร่างแล้ว" : "เผยแพร่แล้ว");
      router.refresh();
    });
  }

  async function handleDelete() {
    const result = await deletePage(id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("ลบหน้าแล้ว");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={published ? "เปลี่ยนเป็นร่าง" : "เผยแพร่"}
        title={published ? "เปลี่ยนเป็นร่าง" : "เผยแพร่"}
      >
        {published ? <EyeOff /> : <Eye />}
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        nativeButton={false}
        render={<Link href={`/admin/pages/${id}/edit`} />}
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
        title="ลบหน้านี้?"
        description={`${label} จะถูกลบถาวร กู้คืนไม่ได้`}
        confirmLabel="ลบหน้า"
        onConfirm={handleDelete}
      />
    </div>
  );
}
