"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import thLocale from "@fullcalendar/core/locales/th";
import type { EventClickArg } from "@fullcalendar/core";
import { MapPin } from "lucide-react";
import { formatEventRange } from "@/lib/event";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// FullCalendar แตะ window ตอน mount → โหลดฝั่ง client เท่านั้น (กัน SSR mismatch)
const FullCalendar = dynamic(() => import("@fullcalendar/react"), {
  ssr: false,
  loading: () => <div className="h-[560px] animate-pulse rounded-2xl border border-border bg-muted/40" aria-hidden="true" />,
});

export type CalendarEvent = {
  id: string;
  title: string;
  start: string; // ISO
  end: string | null; // ISO
  allDay: boolean;
  color: string | null;
  location: string | null;
};

type SelectedEvent = {
  title: string;
  range: string;
  location: string | null;
};

/** บวก 1 วันให้ allDay end เพราะ FullCalendar ตี end เป็น exclusive (ไม่งั้นวันสุดท้ายหาย) */
function inclusiveEnd(end: string | null, allDay: boolean): string | undefined {
  if (!end) return undefined;
  if (!allDay) return end;
  const d = new Date(end);
  d.setDate(d.getDate() + 1);
  return d.toISOString();
}

export function EventCalendar({ events }: { events: CalendarEvent[] }) {
  const [selected, setSelected] = useState<SelectedEvent | null>(null);

  const byId = new Map(events.map((e) => [e.id, e]));

  function handleClick(arg: EventClickArg) {
    const raw = byId.get(arg.event.id);
    if (!raw) return;
    setSelected({
      title: raw.title,
      range: formatEventRange(new Date(raw.start), raw.end ? new Date(raw.end) : null, raw.allDay),
      location: raw.location,
    });
  }

  return (
    <div className="[&_.fc]:text-sm [&_.fc-toolbar-title]:text-lg [&_.fc-toolbar-title]:font-semibold [&_.fc-col-header-cell]:bg-secondary [&_.fc-col-header-cell]:py-2 [&_.fc-col-header-cell-cushion]:text-xs [&_.fc-col-header-cell-cushion]:font-semibold [&_.fc-col-header-cell-cushion]:text-muted-foreground [&_.fc-daygrid-day-number]:text-[12.5px] [&_.fc-event]:cursor-pointer [&_.fc-event]:border-none [&_.fc-list-event]:cursor-pointer [&_.fc-day-today]:bg-secondary/60">
      <FullCalendar
        plugins={[dayGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        locale={thLocale}
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,listMonth",
        }}
        buttonText={{ today: "วันนี้", month: "เดือน", list: "รายการ" }}
        events={events.map((e) => ({
          id: e.id,
          title: e.title,
          start: e.start,
          end: inclusiveEnd(e.end, e.allDay),
          allDay: e.allDay,
          backgroundColor: e.color ?? "var(--primary)",
          borderColor: e.color ?? "var(--primary)",
        }))}
        eventClick={handleClick}
        height="auto"
        dayMaxEvents={3}
        firstDay={0}
        noEventsText="ไม่มีกิจกรรมในช่วงนี้"
      />

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selected?.title}</DialogTitle>
            <DialogDescription className="tabular-nums">{selected?.range}</DialogDescription>
          </DialogHeader>
          {selected?.location && (
            <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4" aria-hidden="true" />
              {selected.location}
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
