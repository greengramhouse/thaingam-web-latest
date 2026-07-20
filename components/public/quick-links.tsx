import Link from "next/link";
import { GraduationCap, CalendarDays, FolderDown, UsersRound } from "lucide-react";

const LINKS = [
  { href: "/admission", title: "การรับสมัคร", subtitle: "ปีการศึกษาใหม่", Icon: GraduationCap, tint: "bg-secondary text-primary" },
  { href: "/calendar", title: "ปฏิทินกิจกรรม", subtitle: "กิจกรรมทั้งปี", Icon: CalendarDays, tint: "bg-sky-muted text-sky-foreground" },
  { href: "/documents", title: "ดาวน์โหลดเอกสาร", subtitle: "แบบฟอร์ม · ประกาศ", Icon: FolderDown, tint: "bg-mint-muted text-mint-foreground" },
  { href: "/staff", title: "ทำเนียบบุคลากร", subtitle: "คณะครูและบุคลากร", Icon: UsersRound, tint: "bg-secondary text-primary" },
];

export function QuickLinks() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 pt-10 sm:px-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {LINKS.map(({ href, title, subtitle, Icon, tint }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3.5 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-[18px]"
          >
            <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tint}`}>
              <Icon className="size-[22px]" strokeWidth={1.8} aria-hidden="true" />
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] font-semibold text-foreground">{title}</span>
              <span className="block truncate text-xs text-muted-foreground">{subtitle}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
