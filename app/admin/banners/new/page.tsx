import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { BannerForm } from "@/components/admin/banner-form";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "เพิ่มแบนเนอร์" };

export default async function NewBannerPage() {
  await requireRole("SUPER_ADMIN", "ADMIN");

  // แนะนำลำดับถัดไป (max+1) ให้รายการใหม่ต่อท้ายเอง
  const last = await prisma.banner.findFirst({ orderBy: { order: "desc" }, select: { order: true } });
  const nextOrder = String((last?.order ?? -1) + 1);

  return (
    <>
      <PageHeader title="เพิ่มแบนเนอร์" description="ภาพจะแสดงในสไลด์ Hero หน้าแรกตามลำดับที่ตั้ง" />
      <BannerForm defaultOrder={nextOrder} />
    </>
  );
}
