"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MailCheck, MailOpen, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deleteContactMessage, setMessageRead } from "@/server/actions/contact-message";

export function MessageDetailActions({ id, isRead }: { id: string; isRead: boolean }) {
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
    router.push("/admin/messages");
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={handleToggle} disabled={isPending}>
        {isRead ? <MailOpen /> : <MailCheck />}
        {isRead ? "ทำเครื่องหมายยังไม่อ่าน" : "ทำเครื่องหมายอ่านแล้ว"}
      </Button>
      <Button variant="outline" size="sm" className="text-destructive" onClick={() => setConfirmOpen(true)}>
        <Trash2 />
        ลบ
      </Button>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="ลบข้อความนี้?"
        description="ข้อความนี้จะถูกลบถาวร กู้คืนไม่ได้"
        confirmLabel="ลบข้อความ"
        onConfirm={handleDelete}
      />
    </div>
  );
}
