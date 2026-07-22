import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { EventCalendar, type CalendarEvent } from "@/components/public/event-calendar";

export const metadata: Metadata = {
  title: "ปฏิทินกิจกรรม",
  description: "กิจกรรมและวันสำคัญของโรงเรียนชุมชนวัดไทยงามตลอดปีการศึกษา",
};

export default async function CalendarPage() {
  const events = await prisma.event.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { startDate: "asc" },
    select: {
      id: true,
      title: true,
      startDate: true,
      endDate: true,
      allDay: true,
      color: true,
      location: true,
    },
  });

  const calendarEvents: CalendarEvent[] = events.map((e) => ({
    id: e.id,
    title: e.title,
    start: e.startDate.toISOString(),
    end: e.endDate?.toISOString() ?? null,
    allDay: e.allDay,
    color: e.color,
    location: e.location,
  }));

  return (
    <div className="mx-auto max-w-[1100px] px-4 py-9 pb-16 sm:px-6">
      <div className="mb-6">
        <h1 className="text-[26px] font-bold tracking-tight sm:text-[30px]">ปฏิทินกิจกรรม</h1>
        <p className="mt-1.5 text-[15px] text-muted-foreground">
          กิจกรรมและวันสำคัญของโรงเรียนตลอดปีการศึกษา
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
        <EventCalendar events={calendarEvents} />
      </div>
    </div>
  );
}
