import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { PageForm } from "@/components/admin/page-form";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "แก้ไขหน้า" };

export default async function EditPagePage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("SUPER_ADMIN", "ADMIN");
  const { id } = await params;

  const page = await prisma.page.findUnique({
    where: { id },
    select: { id: true, title: true, slug: true, content: true, status: true },
  });

  if (!page) notFound();

  return (
    <>
      <PageHeader title="แก้ไขหน้า" description={page.title} />
      <PageForm
        page={{
          id: page.id,
          title: page.title,
          slug: page.slug,
          content: page.content,
          status: page.status,
        }}
      />
    </>
  );
}
