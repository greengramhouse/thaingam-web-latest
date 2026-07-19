import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { AlbumForm } from "@/components/admin/album-form";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "สร้างอัลบั้ม" };

export default async function NewAlbumPage() {
  await requireRole("SUPER_ADMIN", "ADMIN");

  return (
    <>
      <PageHeader title="สร้างอัลบั้ม" description="ตั้งชื่อและ slug ก่อน — บันทึกแล้วจะเพิ่มรูปได้ในหน้าถัดไป" />
      <AlbumForm />
    </>
  );
}
