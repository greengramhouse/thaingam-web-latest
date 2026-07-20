import Link from "next/link";
import { Megaphone, ChevronRight } from "lucide-react";
import { getActiveAnnouncements } from "@/lib/public-content";

/** แถบประกาศด่วนบนสุด (พื้นคราม) — แสดงประกาศที่กำลัง active ล่าสุด */
export async function AnnouncementBar() {
  const announcements = await getActiveAnnouncements();
  if (announcements.length === 0) return null;

  const a = announcements[0];

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl items-center gap-2.5 px-4 py-2 text-sm sm:px-6">
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold">
          <Megaphone className="size-3.5" aria-hidden="true" />
          ประกาศ
        </span>
        <span className="min-w-0 flex-1 truncate">{a.message}</span>
        {a.linkUrl && (
          <Link
            href={a.linkUrl}
            className="inline-flex shrink-0 items-center gap-1 font-medium hover:underline"
          >
            <span className="hidden sm:inline">ดูรายละเอียด</span>
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}
