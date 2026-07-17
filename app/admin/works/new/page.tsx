import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { MediaWorkForm } from "@/components/admin/media-work-form";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "สร้างผลงาน" };

export default async function NewMediaWorkPage() {
  await requireRole("SUPER_ADMIN", "ADMIN");

  const tags = await prisma.tag.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });

  return (
    <>
      <PageHeader
        title="สร้างผลงาน / สื่อการสอน"
        description="เลือกชนิดก่อน แล้วช่องกรอกจะเปลี่ยนตาม — บันทึกเป็นร่างก่อนได้ ค่อยกดเผยแพร่ทีหลัง"
      />
      <MediaWorkForm tags={tags} />
    </>
  );
}
