import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { DocumentForm } from "@/components/admin/document-form";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "เพิ่มเอกสาร" };

export default async function NewDocumentPage() {
  await requireRole("SUPER_ADMIN", "ADMIN");

  return (
    <>
      <PageHeader title="เพิ่มเอกสาร" description="อัปโหลดหรือวางลิงก์ไฟล์ที่จะให้ดาวน์โหลดในเว็บไซต์" />
      <DocumentForm />
    </>
  );
}
