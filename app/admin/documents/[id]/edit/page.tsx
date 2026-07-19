import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { DocumentForm } from "@/components/admin/document-form";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "แก้ไขเอกสาร" };

export default async function EditDocumentPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("SUPER_ADMIN", "ADMIN");
  const { id } = await params;

  const document = await prisma.document.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      fileUrl: true,
      fileType: true,
      category: true,
      status: true,
    },
  });

  if (!document) notFound();

  return (
    <>
      <PageHeader title="แก้ไขเอกสาร" description={document.title} />
      <DocumentForm
        document={{
          id: document.id,
          title: document.title,
          // ฟอร์มใช้ "" แทน null (input ควบคุมค่าไม่ได้ถ้าเป็น null)
          description: document.description ?? "",
          fileUrl: document.fileUrl,
          fileType: document.fileType ?? "",
          category: document.category ?? "",
          published: document.status === "PUBLISHED",
        }}
      />
    </>
  );
}
