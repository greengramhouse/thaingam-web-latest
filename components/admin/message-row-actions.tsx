"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, MailCheck, MailOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deleteContactMessage, setMessageRead } from "@/server/actions/contact-message";

export function MessageRowActions({
  id,
  label,
  isRead,
}: {
  id: string;
  label: string;
  isRead: boolean;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const result = await setMessageRead(id, !isRead);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(isRead ? "ทำเครื่องหมายยังไม่อ่าน" : "ทำเครื่องหมายอ่านแล้ว");
      router.refresh();
    });
  }

  async function handleDelete() {
    const result = await deleteContactMessage(id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("ลบข้อความแล้ว");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        nativeButton={false}
        render={<Link href={`/admin/messages/${id}`} />}
        aria-label="เปิดอ่าน"
        title="เปิดอ่าน"
      >
        <Eye />
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={isRead ? "ทำเครื่องหมายยังไม่อ่าน" : "ทำเครื่องหมายอ่านแล้ว"}
        title={isRead ? "ทำเครื่องหมายยังไม่อ่าน" : "ทำเครื่องหมายอ่านแล้ว"}
      >
        {isRead ? <MailOpen /> : <MailCheck />}
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
        title="ลบข้อความนี้?"
        description={`${label} จะถูกลบถาวร กู้คืนไม่ได้`}
        confirmLabel="ลบข้อความ"
        onConfirm={handleDelete}
      />
    </div>
  );
}
