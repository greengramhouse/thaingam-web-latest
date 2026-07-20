import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { Plus } from "lucide-react";
import { Prisma } from "@/lib/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { TableSearch } from "@/components/admin/table-search";
import { TablePagination } from "@/components/admin/table-pagination";
import { UserRowActions } from "@/components/admin/user-row-actions";
import { roleLabel } from "@/components/admin/role-label";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { USER_ROLES } from "@/lib/validations/user";

export const metadata: Metadata = { title: "ผู้ใช้งาน" };

const PAGE_SIZE = 10;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; role?: string }>;
}) {
  // จัดการผู้ใช้ = SUPER_ADMIN เท่านั้น
  const current = await requireRole("SUPER_ADMIN");
  const { q, page: pageParam, role } = await searchParams;

  const page = Math.max(1, Number(pageParam) || 1);
  const roleFilter = USER_ROLES.find((r) => r === role); // literal union | undefined (assignable ให้ Prisma Role)
  const where: Prisma.UserWhereInput = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(roleFilter ? { role: roleFilter } : {}),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, name: true, email: true, role: true, banned: true, createdAt: true },
    }),
  ]);

  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <PageHeader
        title="ผู้ใช้งาน"
        description="สร้างและจัดการบัญชีผู้ดูแล (สมัครเองไม่ได้ — ต้องสร้างที่นี่เท่านั้น)"
        action={
          <Button nativeButton={false} render={<Link href="/admin/users/new" />}>
            <Plus aria-hidden="true" />
            เพิ่มผู้ใช้
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <TableSearch placeholder="ค้นหาจากชื่อหรืออีเมล…" />
          <div className="flex gap-1">
            {[{ label: "ทั้งหมด", value: undefined }, ...USER_ROLES.map((r) => ({ label: roleLabel(r), value: r }))].map(
              (filter) => {
                const params = new URLSearchParams();
                if (q) params.set("q", q);
                if (filter.value) params.set("role", filter.value);
                const href = params.toString() ? `/admin/users?${params}` : "/admin/users";
                const active = role === filter.value || (!role && !filter.value);
                return (
                  <Button
                    key={filter.label}
                    variant={active ? "secondary" : "ghost"}
                    size="sm"
                    nativeButton={false}
                    render={<Link href={href} />}
                  >
                    {filter.label}
                  </Button>
                );
              },
            )}
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {users.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-12 text-center">
                <p className="font-medium">{q || role ? "ไม่พบผู้ใช้ที่ค้นหา" : "ยังไม่มีผู้ใช้"}</p>
                <p className="text-sm text-muted-foreground">
                  {q || role ? "ลองเปลี่ยนคำค้นหรือตัวกรอง" : "เริ่มจากกดปุ่ม “เพิ่มผู้ใช้” ด้านบน"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อ</TableHead>
                    <TableHead>บทบาท</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="hidden sm:table-cell">สร้างเมื่อ</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => {
                    const isSelf = u.id === current.id;
                    return (
                      <TableRow key={u.id}>
                        <TableCell>
                          <span className="font-medium">
                            {u.name}
                            {isSelf && <span className="ml-1.5 text-xs text-muted-foreground">(บัญชีคุณ)</span>}
                          </span>
                          <span className="block text-xs text-muted-foreground">{u.email}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.role === "SUPER_ADMIN" ? "default" : "secondary"}>
                            {roleLabel(u.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {u.banned ? (
                            <Badge variant="destructive">ถูกแบน</Badge>
                          ) : (
                            <Badge variant="outline">ใช้งานอยู่</Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {format(u.createdAt, "d MMM yy", { locale: th })}
                        </TableCell>
                        <TableCell>
                          <UserRowActions
                            user={{ id: u.id, name: u.name, role: u.role, banned: Boolean(u.banned) }}
                            isSelf={isSelf}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <TablePagination basePath="/admin/users" params={{ q, role }} page={page} pageCount={pageCount} total={total} />
      </div>
    </>
  );
}
