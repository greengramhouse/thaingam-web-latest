"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { visibleNavGroups, type NavItem } from "@/components/admin/nav-items";

/** เมนูปัจจุบัน — /admin ต้อง match แบบเป๊ะ ไม่งั้นมันจะ active ตลอดเพราะทุก path ขึ้นต้นด้วย /admin */
function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavRow({ item, active, onNavigate }: { item: NavItem; active: boolean; onNavigate?: () => void }) {
  const Icon = item.icon;

  if (!item.ready) {
    return (
      <span
        className="flex cursor-default items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground/45"
        aria-disabled="true"
        title={item.phase ? `กำลังจะมาใน Phase ${item.phase}` : "ยังไม่เปิดใช้งาน"}
      >
        <Icon className="size-[18px] shrink-0" aria-hidden="true" />
        <span className="flex-1 truncate">{item.label}</span>
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] leading-none font-medium text-muted-foreground">
          เร็ว ๆ นี้
        </span>
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      onClick={onNavigate}
      className={cn(
        "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        active
          ? "bg-secondary text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {active ? (
        <span
          className="absolute top-2 bottom-2 left-0 w-[3px] rounded-full bg-primary"
          aria-hidden="true"
        />
      ) : null}
      <Icon className="size-[18px] shrink-0" aria-hidden="true" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function SidebarNav({ role, onNavigate }: { role?: string | null; onNavigate?: () => void }) {
  const pathname = usePathname();
  const groups = visibleNavGroups(role);

  return (
    <nav className="flex flex-col gap-4 p-3" aria-label="เมนูหลังบ้าน">
      {groups.map((group) => (
        <div key={group.title} className="flex flex-col gap-0.5">
          <h2 className="px-3 pt-1 pb-1.5 text-[11px] font-semibold tracking-wider text-muted-foreground/80 uppercase">
            {group.title}
          </h2>
          {group.items.map((item) => (
            <NavRow key={item.href} item={item} active={isActive(pathname, item.href)} onNavigate={onNavigate} />
          ))}
        </div>
      ))}
    </nav>
  );
}
