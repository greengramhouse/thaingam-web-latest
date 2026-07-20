import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { AnnouncementForm } from "@/components/admin/announcement-form";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "เพิ่มประกาศ" };

export default async function NewAnnouncementPage() {
  await requireRole("SUPER_ADMIN", "ADMIN");

  return (
    <>
      <PageHeader title="เพิ่มประกาศ" description="แถบข้อความจะแสดงบนสุดของหน้าแรกตามช่วงเวลาที่ตั้ง" />
      <AnnouncementForm />
    </>
  );
}
