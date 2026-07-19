import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { BannerForm } from "@/components/admin/banner-form";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "แก้ไขแบนเนอร์" };

export default async function EditBannerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("SUPER_ADMIN", "ADMIN");
  const { id } = await params;

  const banner = await prisma.banner.findUnique({
    where: { id },
    select: { id: true, title: true, image: true, linkUrl: true, order: true, isActive: true },
  });

  if (!banner) notFound();

  return (
    <>
      <PageHeader title="แก้ไขแบนเนอร์" description={banner.title ?? "ภาพไม่มีชื่อ"} />
      <BannerForm
        banner={{
          id: banner.id,
          // ฟอร์มใช้ "" แทน null (input ควบคุมค่าไม่ได้ถ้าเป็น null)
          title: banner.title ?? "",
          image: banner.image,
          linkUrl: banner.linkUrl ?? "",
          order: String(banner.order),
          isActive: banner.isActive,
        }}
      />
    </>
  );
}
