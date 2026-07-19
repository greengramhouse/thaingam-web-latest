import { Suspense } from "react";
import Link from "next/link";
import { format, startOfMonth } from "date-fns";
import { th } from "date-fns/locale";
import {
  ArrowUp,
  Calendar,
  CircleCheckBig,
  Images,
  Newspaper,
  Plus,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/admin/status-badge";
import { roleLabelShort } from "@/components/admin/role-label";
import { cn } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

const PANEL = "rounded-2xl border border-border bg-card shadow-sm";

// ── ข้อมูล ───────────────────────────────────────────────────────────────

async function getStats() {
  const monthStart = startOfMonth(new Date());

  const [
    newsTotal,
    newsPublished,
    newsThisMonth,
    worksTotal,
    worksThisMonth,
    usersTotal,
    admins,
  ] = await Promise.all([
    prisma.news.count(),
    prisma.news.count({ where: { status: "PUBLISHED" } }),
    prisma.news.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.mediaWork.count(),
    prisma.mediaWork.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.user.count(),
    prisma.user.count({ where: { role: { in: ["SUPER_ADMIN", "ADMIN"] } } }),
  ]);

  return {
    newsTotal,
    newsPublished,
    newsDraft: newsTotal - newsPublished,
    newsThisMonth,
    worksTotal,
    worksThisMonth,
    usersTotal,
    admins,
  };
}

// ── ชิ้นส่วนเล็ก ─────────────────────────────────────────────────────────

type Tone = "brand" | "mint" | "sky";

const TONE_TILE: Record<Tone, string> = {
  brand: "bg-secondary text-primary",
  mint: "bg-mint-muted text-mint-foreground",
  sky: "bg-sky-muted text-sky-foreground",
};

function IconTile({ icon: Icon, tone }: { icon: LucideIcon; tone: Tone }) {
  return (
    <span className={cn("flex size-10 items-center justify-center rounded-xl", TONE_TILE[tone])}>
      <Icon className="size-5" aria-hidden="true" />
    </span>
  );
}

function TrendBadge({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-mint-muted px-2 py-0.5 text-xs font-semibold text-mint-foreground"
      title="เพิ่มขึ้นในเดือนนี้"
    >
      <ArrowUp className="size-3" aria-hidden="true" />
      {n}
    </span>
  );
}

function StatCard({
  icon,
  tone,
  value,
  label,
  meta,
}: {
  icon: LucideIcon;
  tone: Tone;
  value: number;
  label: string;
  meta?: React.ReactNode;
}) {
  return (
    <div className={cn(PANEL, "p-5")}>
      <div className="mb-3.5 flex items-center justify-between gap-2">
        <IconTile icon={icon} tone={tone} />
        {meta}
      </div>
      <div className="text-3xl leading-none font-bold tabular-nums">{value}</div>
      <p className="mt-1.5 text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

// ── การ์ดสถิติ ───────────────────────────────────────────────────────────

async function StatCards() {
  const s = await getStats();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={Newspaper}
        tone="brand"
        value={s.newsTotal}
        label="ข่าวทั้งหมด"
        meta={<TrendBadge n={s.newsThisMonth} />}
      />
      <StatCard
        icon={CircleCheckBig}
        tone="mint"
        value={s.newsPublished}
        label={`เผยแพร่แล้ว · ร่าง ${s.newsDraft}`}
        meta={<span className="text-xs font-medium text-muted-foreground">ร่าง {s.newsDraft}</span>}
      />
      <StatCard
        icon={Video}
        tone="sky"
        value={s.worksTotal}
        label="ผลงาน / สื่อการสอน"
        meta={<TrendBadge n={s.worksThisMonth} />}
      />
      <StatCard
        icon={Users}
        tone="brand"
        value={s.usersTotal}
        label="ผู้ใช้งานระบบ"
        meta={<span className="text-xs font-medium text-muted-foreground">ผู้ดูแล {s.admins}</span>}
      />
    </div>
  );
}

function StatCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className={cn(PANEL, "p-5")}>
          <Skeleton className="mb-3.5 size-10 rounded-xl" />
          <Skeleton className="h-8 w-12" />
          <Skeleton className="mt-2 h-4 w-28" />
        </div>
      ))}
    </div>
  );
}

// ── ข่าวล่าสุด ───────────────────────────────────────────────────────────

async function RecentNews() {
  const news = await prisma.news.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      title: true,
      status: true,
      publishedAt: true,
      createdAt: true,
      category: { select: { name: true } },
    },
  });

  if (news.length === 0) {
    return (
      <div className="px-5 py-10 text-center">
        <p className="text-sm text-muted-foreground">ยังไม่มีข่าวในระบบ</p>
        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          className="mt-3"
          render={<Link href="/admin/news/new" />}
        >
          <Plus aria-hidden="true" />
          เขียนข่าวแรก
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-muted/60 text-left text-xs font-semibold text-muted-foreground">
            <th className="px-5 py-2.5 font-semibold">หัวข้อ</th>
            <th className="px-3 py-2.5 font-semibold">หมวดหมู่</th>
            <th className="px-3 py-2.5 font-semibold">สถานะ</th>
            <th className="px-5 py-2.5 text-right font-semibold">วันที่</th>
          </tr>
        </thead>
        <tbody>
          {news.map((item) => (
            <tr key={item.id} className="border-t border-border transition-colors hover:bg-background">
              <td className="max-w-[280px] px-5 py-3 font-medium">
                <Link
                  href={`/admin/news/${item.id}/edit`}
                  className="line-clamp-1 text-foreground hover:text-primary"
                >
                  {item.title}
                </Link>
              </td>
              <td className="px-3 py-3">
                {item.category ? (
                  <span className="inline-flex rounded-full bg-sky-muted px-2.5 py-0.5 text-xs font-medium text-sky-foreground">
                    {item.category.name}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </td>
              <td className="px-3 py-3">
                <StatusBadge status={item.status} />
              </td>
              <td className="px-5 py-3 text-right text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                {format(item.publishedAt ?? item.createdAt, "d MMM yy", { locale: th })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecentNewsSkeleton() {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  );
}

// ── ผู้ใช้งานล่าสุด ───────────────────────────────────────────────────────

const AVATAR_TONE: Record<string, string> = {
  SUPER_ADMIN: "bg-primary",
  ADMIN: "bg-sky",
  TEACHER: "bg-mint",
};

const ROLE_PILL: Record<string, string> = {
  SUPER_ADMIN: "bg-secondary text-primary",
  ADMIN: "bg-sky-muted text-sky-foreground",
  TEACHER: "bg-muted text-muted-foreground",
};

function initials(name: string) {
  return name.trim().slice(0, 2).toUpperCase() || "??";
}

async function RecentUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 4,
    select: { id: true, name: true, email: true, role: true },
  });

  if (users.length === 0) {
    return <p className="text-sm text-muted-foreground">ยังไม่มีผู้ใช้ในระบบ</p>;
  }

  return (
    <ul className="flex flex-col gap-3.5">
      {users.map((user) => (
        <li key={user.id} className="flex items-center gap-3">
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white",
              AVATAR_TONE[user.role] ?? "bg-muted-foreground",
            )}
            aria-hidden="true"
          >
            {initials(user.name)}
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-[13.5px] font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
              ROLE_PILL[user.role] ?? "bg-muted text-muted-foreground",
            )}
          >
            {roleLabelShort(user.role)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function RecentUsersSkeleton() {
  return (
    <div className="space-y-3.5">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="size-9 shrink-0 rounded-full" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── ทางลัด ───────────────────────────────────────────────────────────────

const SHORTCUTS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/admin/news/new", label: "เขียนข่าว", icon: Newspaper },
  { href: "/admin/events/new", label: "เพิ่มกิจกรรม", icon: Calendar },
  { href: "/admin/works/new", label: "เพิ่มสื่อ", icon: Video },
  { href: "/admin/albums/new", label: "เพิ่มอัลบั้ม", icon: Images },
];

function Shortcuts() {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {SHORTCUTS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="flex flex-col gap-2 rounded-xl border border-border p-3.5 transition-colors hover:border-primary/40 hover:bg-secondary/60"
        >
          <Icon className="size-5 text-primary" aria-hidden="true" />
          <span className="text-[13px] font-medium">{label}</span>
        </Link>
      ))}
    </div>
  );
}

// ── หน้า ─────────────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  const user = await requireRole("SUPER_ADMIN", "ADMIN");

  return (
    <div className="mx-auto max-w-[1280px] space-y-6">
      {/* หัวเรื่อง + CTA */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight lg:text-[26px]">
            สวัสดี, {user.name} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground lg:text-base">
            ภาพรวมข้อมูลและกิจกรรมล่าสุดของเว็บไซต์โรงเรียน
          </p>
        </div>
        <Button size="lg" nativeButton={false} render={<Link href="/admin/news/new" />}>
          <Plus aria-hidden="true" />
          เพิ่มข่าวใหม่
        </Button>
      </div>

      {/* การ์ดสถิติ */}
      <Suspense fallback={<StatCardsSkeleton />}>
        <StatCards />
      </Suspense>

      {/* สองคอลัมน์ */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.7fr_1fr]">
        {/* ข่าวล่าสุด */}
        <section className={cn(PANEL, "overflow-hidden")}>
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold">ข่าวล่าสุด</h2>
            <Link
              href="/admin/news"
              className="text-sm font-medium text-sky-foreground hover:underline"
            >
              ดูทั้งหมด
            </Link>
          </div>
          <Suspense fallback={<RecentNewsSkeleton />}>
            <RecentNews />
          </Suspense>
        </section>

        {/* คอลัมน์ขวา */}
        <div className="flex flex-col gap-5">
          <section className={cn(PANEL, "p-5")}>
            <h2 className="mb-3.5 text-base font-semibold">ทางลัด</h2>
            <Shortcuts />
          </section>

          <section className={cn(PANEL, "p-5")}>
            <h2 className="mb-4 text-base font-semibold">ผู้ใช้งานล่าสุด</h2>
            <Suspense fallback={<RecentUsersSkeleton />}>
              <RecentUsers />
            </Suspense>
          </section>
        </div>
      </div>
    </div>
  );
}
