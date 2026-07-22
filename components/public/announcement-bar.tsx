import { Megaphone } from "lucide-react";
import { getActiveAnnouncements } from "@/lib/public-content";
import { AnnouncementMarquee } from "@/components/public/announcement-marquee";

/**
 * แถบประกาศด่วนบนสุด (พื้นคราม) — server fetch ประกาศ active แล้วส่งให้ client marquee
 * marquee เลื่อนเฉพาะตอนข้อความล้นกรอบ (กันเห็นสำเนาซ้ำตอนประกาศสั้น/จอกว้าง)
 */
export async function AnnouncementBar() {
  const announcements = await getActiveAnnouncements();
  if (announcements.length === 0) return null;

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 text-sm sm:px-6">
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-semibold">
          <Megaphone className="size-3.5" aria-hidden="true" />
          ประกาศ
        </span>
        <AnnouncementMarquee items={announcements} />
      </div>
    </div>
  );
}
