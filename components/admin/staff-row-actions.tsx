"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deleteStaff, toggleStaffActive } from "@/server/actions/staff";

export function StaffRowActions({
  id,
  name,
  isActive,
}: {
  id: string;
  name: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleStaffActive(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(isActive ? "ซ่อนจากหน้าเว็บแล้ว" : "แสดงบนหน้าเว็บแล้ว");
      router.refresh();
    });
  }

  async function handleDelete() {
    const result = await deleteStaff(id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("ลบบุคลากรแล้ว");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={isActive ? "ซ่อนจากหน้าเว็บ" : "แสดงบนหน้าเว็บ"}
        title={isActive ? "ซ่อนจากหน้าเว็บ" : "แสดงบนหน้าเว็บ"}
      >
        {isActive ? <EyeOff /> : <Eye />}
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        nativeButton={false}
        render={<Link href={`/admin/staff/${id}/edit`} />}
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
        title="ลบบุคลากรนี้?"
        description={`“${name}” จะถูกลบถาวร กู้คืนไม่ได้`}
        confirmLabel="ลบบุคลากร"
        onConfirm={handleDelete}
      />
    </div>
  );
}
