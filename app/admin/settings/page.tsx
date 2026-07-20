import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "ตั้งค่าเว็บไซต์" };

export default async function AdminSettingsPage() {
  // ตั้งค่าเว็บไซต์ = SUPER_ADMIN เท่านั้น (ตรงกับ nav superAdminOnly)
  await requireRole("SUPER_ADMIN");

  const rows = await prisma.siteSetting.findMany({ select: { key: true, value: true } });
  const values = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return (
    <>
      <PageHeader
        title="ตั้งค่าเว็บไซต์"
        description="ข้อมูลติดต่อ โซเชียลมีเดีย และแผนที่ ที่แสดงในส่วนท้ายเว็บและหน้าติดต่อเรา"
      />
      <SiteSettingsForm values={values} />
    </>
  );
}
