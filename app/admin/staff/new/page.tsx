import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { StaffForm } from "@/components/admin/staff-form";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "เพิ่มบุคลากร" };

export default async function NewStaffPage() {
  await requireRole("SUPER_ADMIN", "ADMIN");

  return (
    <>
      <PageHeader
        title="เพิ่มบุคลากร"
        description="เพิ่มแล้วจะไปต่อท้ายกลุ่ม/ฝ่ายที่กรอก — จัดลำดับด้วยปุ่มลูกศรที่หน้ารายชื่อ"
      />
      <StaffForm />
    </>
  );
}
