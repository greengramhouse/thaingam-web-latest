import { Suspense } from "react";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { ShieldCheck, UserCheck, Users, UsersRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/components/admin/page-header";
import { roleLabel } from "@/components/admin/role-label";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

// ⏭️ Phase 4.4: เพิ่มการ์ดจำนวนข่าว/ผลงาน/กิจกรรม/ข้อความใหม่ + รายการ DRAFT รออนุมัติ
//    ตอนนี้ DB มีแค่ตาราง auth การ์ดข้างล่างจึงนับจาก User/Session เท่านั้น (ไม่มีตัวเลขปลอม)

async function getStats() {
  const [total, superAdmins, admins, teachers, activeSessions] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "SUPER_ADMIN" } }),
    prisma.user.count({ where: { role: "ADMIN" } }),
    prisma.user.count({ where: { role: "TEACHER" } }),
    prisma.session.findMany({
      where: { expiresAt: { gt: new Date() } },
      distinct: ["userId"],
      select: { userId: true },
    }),
  ]);

  return { total, superAdmins, admins, teachers, activeUsers: activeSessions.length };
}

function StatCard({
  title,
  value,
  hint,
  icon: Icon,
}: {
  title: string;
  value: number;
  hint: string;
  icon: typeof Users;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tabular-nums">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
}

async function StatCards() {
  const stats = await getStats();

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard title="ผู้ใช้ทั้งหมด" value={stats.total} hint="บัญชีในระบบ" icon={Users} />
      <StatCard
        title="ผู้ดูแลระบบ"
        value={stats.superAdmins + stats.admins}
        hint={`สูงสุด ${stats.superAdmins} · ทั่วไป ${stats.admins}`}
        icon={ShieldCheck}
      />
      <StatCard title="ครู" value={stats.teachers} hint="ยังไม่มีสิทธิ์ในหลังบ้าน" icon={UsersRound} />
      <StatCard title="กำลังใช้งาน" value={stats.activeUsers} hint="มี session ที่ยังไม่หมดอายุ" icon={UserCheck} />
    </div>
  );
}

function StatCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-7 w-12" />
            <Skeleton className="h-3 w-28" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

async function RecentUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  if (users.length === 0) {
    return <p className="text-sm text-muted-foreground">ยังไม่มีผู้ใช้ในระบบ</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {users.map((user) => (
        <li key={user.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-xs font-medium">{roleLabel(user.role)}</p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(user.createdAt, { addSuffix: true, locale: th })}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

function RecentUsersSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }, (_, i) => (
        <Skeleton key={i} className="h-10 w-full" />
      ))}
    </div>
  );
}

export default async function AdminDashboardPage() {
  const user = await requireRole("SUPER_ADMIN", "ADMIN");

  return (
    <>
      <PageHeader title="แดชบอร์ด" description={`สวัสดี ${user.name} — ${roleLabel(user.role)}`} />

      <div className="space-y-6">
        <Suspense fallback={<StatCardsSkeleton />}>
          <StatCards />
        </Suspense>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">ผู้ใช้ล่าสุด</CardTitle>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<RecentUsersSkeleton />}>
              <RecentUsers />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">ขั้นถัดไป</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>
              เมนูที่ขึ้นป้าย <span className="font-medium text-foreground">&ldquo;เร็ว ๆ นี้&rdquo;</span>{" "}
              ยังไม่มีหน้าจริง — จะทยอยเปิดใช้ใน Phase 4.4 (Admin CRUD) พร้อมการ์ดสถิติของข่าว ผลงาน และกิจกรรม
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
