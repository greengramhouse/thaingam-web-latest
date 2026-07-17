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
  const className = cn(
    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
    active
      ? "bg-accent font-medium text-accent-foreground"
      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
  );

  if (!item.ready) {
    return (
      <span
        className="flex cursor-not-allowed items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground/50"
        aria-disabled="true"
        title={item.phase ? `กำลังจะมาใน Phase ${item.phase}` : "ยังไม่เปิดใช้งาน"}
      >
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{item.label}</span>
        <span className="ml-auto shrink-0 rounded border border-border/60 px-1.5 py-0.5 text-[10px] leading-none">
          เร็ว ๆ นี้
        </span>
      </span>
    );
  }

  return (
    <Link href={item.href} className={className} aria-current={active ? "page" : undefined} onClick={onNavigate}>
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

export function SidebarNav({ role, onNavigate }: { role?: string | null; onNavigate?: () => void }) {
  const pathname = usePathname();
  const groups = visibleNavGroups(role);

  return (
    <nav className="flex flex-col gap-6 p-3" aria-label="เมนูหลังบ้าน">
      {groups.map((group) => (
        <div key={group.title} className="flex flex-col gap-1">
          <h2 className="px-3 pb-1 text-xs font-medium tracking-wide text-muted-foreground/70">{group.title}</h2>
          {group.items.map((item) => (
            <NavRow key={item.href} item={item} active={isActive(pathname, item.href)} onNavigate={onNavigate} />
          ))}
        </div>
      ))}
    </nav>
  );
}
