import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { EventForm } from "@/components/admin/event-form";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "สร้างกิจกรรม" };

export default async function NewEventPage() {
  await requireRole("SUPER_ADMIN", "ADMIN");

  return (
    <>
      <PageHeader
        title="สร้างกิจกรรม"
        description="กำหนดวันเวลาและสถานที่ — เปิด “ทั้งวัน” สำหรับกิจกรรมที่ไม่ระบุเวลา"
      />
      <EventForm />
    </>
  );
}
