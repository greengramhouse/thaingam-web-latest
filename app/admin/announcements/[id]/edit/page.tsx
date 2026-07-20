import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { AnnouncementForm } from "@/components/admin/announcement-form";
import { eventDateInputValue } from "@/lib/event";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "แก้ไขประกาศ" };

export default async function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("SUPER_ADMIN", "ADMIN");
  const { id } = await params;

  const announcement = await prisma.announcement.findUnique({
    where: { id },
    select: { id: true, message: true, linkUrl: true, isActive: true, startsAt: true, endsAt: true },
  });

  if (!announcement) notFound();

  return (
    <>
      <PageHeader title="แก้ไขประกาศ" description={announcement.message} />
      <AnnouncementForm
        announcement={{
          id: announcement.id,
          message: announcement.message,
          // ฟอร์มใช้ "" แทน null (input ควบคุมค่าไม่ได้ถ้าเป็น null)
          linkUrl: announcement.linkUrl ?? "",
          startsAt: eventDateInputValue(announcement.startsAt, false),
          endsAt: eventDateInputValue(announcement.endsAt, false),
          isActive: announcement.isActive,
        }}
      />
    </>
  );
}
