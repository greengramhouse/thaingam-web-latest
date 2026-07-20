import Link from "next/link";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Clock, MapPin, CalendarDays } from "lucide-react";

export type EventItem = {
  id: string;
  title: string;
  startDate: Date;
  allDay: boolean;
  location: string | null;
  color: string | null;
};

export function EventsSection({ events }: { events: EventItem[] }) {
  if (events.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6">
      <div className="grid items-center gap-8 lg:grid-cols-[.9fr_1.1fr] lg:gap-10">
        <div>
          <div className="mb-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-sky-foreground">
            ปฏิทินโรงเรียน
          </div>
          <h2 className="mb-3.5 text-2xl font-bold tracking-tight sm:text-[28px]">กิจกรรมที่กำลังจะมาถึง</h2>
          <p className="mb-6 text-[15.5px] leading-relaxed text-muted-foreground">
            ติดตามกิจกรรมสำคัญของโรงเรียน ทั้งกิจกรรมวิชาการ กีฬาสี และงานประเพณีต่าง ๆ ตลอดปีการศึกษา
          </p>
          <Link
            href="/calendar"
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-5 text-sm font-semibold text-primary transition-colors hover:bg-accent"
          >
            ดูปฏิทินทั้งหมด
            <CalendarDays className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="flex flex-col gap-3">
          {events.map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
            >
              <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-xl bg-secondary">
                <span className="text-[22px] font-bold leading-none text-primary tabular-nums">
                  {format(e.startDate, "dd")}
                </span>
                <span className="text-[11.5px] text-muted-foreground">{format(e.startDate, "MMM", { locale: th })}</span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="mb-1 line-clamp-1 text-[15.5px] font-semibold">{e.title}</h3>
                <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[12.5px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" aria-hidden="true" />
                    {e.allDay ? "ทั้งวัน" : `${format(e.startDate, "HH:mm")} น.`}
                  </span>
                  {e.location && (
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3.5" aria-hidden="true" />
                      <span className="line-clamp-1">{e.location}</span>
                    </span>
                  )}
                </div>
              </div>
              <span
                className="h-10 w-2 shrink-0 rounded-full"
                style={{ background: e.color || "var(--primary)" }}
                aria-hidden="true"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
