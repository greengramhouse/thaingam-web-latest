"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { deleteBanner, toggleBannerActive } from "@/server/actions/banner";

export function BannerRowActions({
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
      const result = await toggleBannerActive(id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(isActive ? "ซ่อนจากหน้าแรกแล้ว" : "แสดงบนหน้าแรกแล้ว");
      router.refresh();
    });
  }

  async function handleDelete() {
    const result = await deleteBanner(id);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("ลบแบนเนอร์แล้ว");
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={handleToggle}
        disabled={isPending}
        aria-label={isActive ? "ซ่อนจากหน้าแรก" : "แสดงบนหน้าแรก"}
        title={isActive ? "ซ่อนจากหน้าแรก" : "แสดงบนหน้าแรก"}
      >
        {isActive ? <EyeOff /> : <Eye />}
      </Button>

      <Button
        variant="ghost"
        size="icon-sm"
        nativeButton={false}
        render={<Link href={`/admin/banners/${id}/edit`} />}
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
        title="ลบแบนเนอร์นี้?"
        description={`${label} จะถูกลบถาวร กู้คืนไม่ได้ (รูปบน Cloudinary/Drive ไม่ถูกลบ)`}
        confirmLabel="ลบแบนเนอร์"
        onConfirm={handleDelete}
      />
    </div>
  );
}
