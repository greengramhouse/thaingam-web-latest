import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { StaffForm } from "@/components/admin/staff-form";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "เพิ่มบุคลากร" };

export default async function NewStaffPage() {
  await requireRole("SUPER_ADMIN", "ADMIN");

  // แนะนำลำดับถัดไป (max+1) ให้รายการใหม่ต่อท้ายเอง ไม่ต้องคิดเลข
  const last = await prisma.staff.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
  const nextOrder = String((last?.order ?? -1) + 1);

  return (
    <>
      <PageHeader title="เพิ่มบุคลากร" description="ข้อมูลจะแสดงในหน้าทำเนียบบุคลากรตามลำดับที่ตั้ง" />
      <StaffForm defaultOrder={nextOrder} />
    </>
  );
}
