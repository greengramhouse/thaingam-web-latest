import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { EventForm } from "@/components/admin/event-form";
import { eventDateInputValue } from "@/lib/event";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "แก้ไขกิจกรรม" };

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("SUPER_ADMIN", "ADMIN");
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      description: true,
      location: true,
      allDay: true,
      startDate: true,
      endDate: true,
      color: true,
      coverImage: true,
      status: true,
    },
  });

  if (!event) notFound();

  return (
    <>
      <PageHeader title="แก้ไขกิจกรรม" description={event.title} />
      <EventForm
        event={{
          id: event.id,
          title: event.title,
          // ฟอร์มใช้ "" แทน null (input ควบคุมค่าไม่ได้ถ้าเป็น null)
          description: event.description ?? "",
          location: event.location ?? "",
          allDay: event.allDay,
          // Date → string ตามรูป input (date/datetime-local) อิง timezone ท้องถิ่น
          startDate: eventDateInputValue(event.startDate, event.allDay),
          endDate: eventDateInputValue(event.endDate, event.allDay),
          color: event.color ?? "",
          coverImage: event.coverImage ?? "",
          status: event.status,
        }}
      />
    </>
  );
}
