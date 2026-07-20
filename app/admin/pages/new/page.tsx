import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { PageForm } from "@/components/admin/page-form";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "สร้างหน้า" };

export default async function NewPagePage() {
  await requireRole("SUPER_ADMIN", "ADMIN");

  return (
    <>
      <PageHeader title="สร้างหน้า" description="หน้าเนื้อหาจะแสดงที่ /slug-ที่กรอก เมื่อเผยแพร่" />
      <PageForm />
    </>
  );
}
