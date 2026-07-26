import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { StaffForm } from "@/components/admin/staff-form";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "แก้ไขบุคลากร" };

export default async function EditStaffPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("SUPER_ADMIN", "ADMIN");
  const { id } = await params;

  const staff = await prisma.staff.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      position: true,
      department: true,
      email: true,
      phone: true,
      bio: true,
      photo: true,
      isActive: true,
    },
  });

  if (!staff) notFound();

  return (
    <>
      <PageHeader title="แก้ไขบุคลากร" description={staff.name} />
      <StaffForm
        staff={{
          id: staff.id,
          name: staff.name,
          position: staff.position,
          // ฟอร์มใช้ "" แทน null (input ควบคุมค่าไม่ได้ถ้าเป็น null)
          department: staff.department ?? "",
          email: staff.email ?? "",
          phone: staff.phone ?? "",
          bio: staff.bio ?? "",
          photo: staff.photo ?? "",
          isActive: staff.isActive,
        }}
      />
    </>
  );
}
