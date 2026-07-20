"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deleteAnnouncement, toggleAnnouncementActive } from "@/server/actions/announcement";

export function AnnouncementRowActions({
  id,
  label,
  isActive,
}: {
  id: string;
  label: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleAnnouncementActive(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(isActive ? "ปิดการแสดงประกาศแล้ว" : "เปิดการแสดงประกาศแล้ว");
      router.refresh();
    });
  }

  async function handleDelete() {
    const result = await deleteAnnouncement(id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("ลบประกาศแล้ว");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={isActive ? "ปิดการแสดง" : "เปิดการแสดง"}
        title={isActive ? "ปิดการแสดง" : "เปิดการแสดง"}
      >
        {isActive ? <EyeOff /> : <Eye />}
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        nativeButton={false}
        render={<Link href={`/admin/announcements/${id}/edit`} />}
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
        title="ลบประกาศนี้?"
        description={`${label} จะถูกลบถาวร กู้คืนไม่ได้`}
        confirmLabel="ลบประกาศ"
        onConfirm={handleDelete}
      />
    </div>
  );
}
