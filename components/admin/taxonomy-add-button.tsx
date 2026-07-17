"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaxonomyDialog, type TaxonomyKind } from "@/components/admin/taxonomy-dialog";

/** ปุ่มเปิด dialog สร้างใหม่ — แยกไฟล์เพราะหน้า /admin/categories เป็น Server Component */
export function TaxonomyAddButton({
  kind,
  size = "default",
}: {
  kind: TaxonomyKind;
  size?: "default" | "sm";
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size={size} onClick={() => setOpen(true)}>
        <Plus aria-hidden="true" />
        {kind === "category" ? "เพิ่มหมวดหมู่" : "เพิ่มแท็ก"}
      </Button>
      <TaxonomyDialog kind={kind} open={open} onOpenChange={setOpen} />
    </>
  );
}
