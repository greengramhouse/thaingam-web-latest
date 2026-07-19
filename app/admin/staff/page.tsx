import type { Metadata } from "next";
import Link from "next/link";
import { Mail, Phone, Plus, UserRound } from "lucide-react";
import { Prisma } from "@/lib/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { TableSearch } from "@/components/admin/table-search";
import { TablePagination } from "@/components/admin/table-pagination";
import { StaffRowActions } from "@/components/admin/staff-row-actions";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "ทำเนียบบุคลากร" };

const PAGE_SIZE = 10;

export default async function AdminStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; active?: string }>;
}) {
  await requireRole("SUPER_ADMIN", "ADMIN");
  const { q, page: pageParam, active } = await searchParams;

  const page = Math.max(1, Number(pageParam) || 1);
  const where: Prisma.StaffWhereInput = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { position: { contains: q, mode: "insensitive" } },
            { department: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(active === "1" ? { isActive: true } : active === "0" ? { isActive: false } : {}),
  };

  const [total, staff] = await Promise.all([
    prisma.staff.count({ where }),
    prisma.staff.findMany({
      where,
      // เรียงตามลำดับที่แอดมินตั้ง (น้อย→มาก) แล้วชื่อ — ตรงกับหน้าเว็บสาธารณะ
      orderBy: [{ order: "asc" }, { name: "asc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        position: true,
        department: true,
        photo: true,
        email: true,
        phone: true,
        order: true,
        isActive: true,
      },
    }),
  ]);

  const pageCount = Math.ceil(total / PAGE_SIZE);
  const hasFilter = Boolean(q || active);

  function filterHref(nextActive?: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (nextActive) params.set("active", nextActive);
    return params.toString() ? `/admin/staff?${params}` : "/admin/staff";
  }

  return (
    <>
      <PageHeader
        title="ทำเนียบบุคลากร"
        description="รายชื่อผู้บริหาร ครู และบุคลากร แสดงในหน้าทำเนียบสาธารณะ (เรียงตามลำดับที่ตั้ง)"
        action={
          <Button nativeButton={false} render={<Link href="/admin/staff/new" />}>
            <Plus aria-hidden="true" />
            เพิ่มบุคลากร
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <TableSearch placeholder="ค้นหาจากชื่อ ตำแหน่ง หรือฝ่าย…" />

          <div className="flex gap-1">
            {[
              { label: "ทั้งหมด", value: undefined },
              { label: "แสดงอยู่", value: "1" },
              { label: "ซ่อนอยู่", value: "0" },
            ].map((filter) => (
              <Button
                key={filter.label}
                variant={active === filter.value || (!active && !filter.value) ? "secondary" : "ghost"}
                size="sm"
                nativeButton={false}
                render={<Link href={filterHref(filter.value)} />}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {staff.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-12 text-center">
                <p className="font-medium">{hasFilter ? "ไม่พบบุคลากรที่ค้นหา" : "ยังไม่มีบุคลากร"}</p>
                <p className="text-sm text-muted-foreground">
                  {hasFilter ? "ลองเปลี่ยนคำค้นหรือตัวกรอง" : "เริ่มจากกดปุ่ม “เพิ่มบุคลากร” ด้านบน"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">ลำดับ</TableHead>
                    <TableHead>ชื่อ–ตำแหน่ง</TableHead>
                    <TableHead className="hidden md:table-cell">ฝ่าย/กลุ่มสาระ</TableHead>
                    <TableHead className="hidden lg:table-cell">ติดต่อ</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((person) => (
                    <TableRow key={person.id} className={person.isActive ? undefined : "opacity-60"}>
                      <TableCell className="text-center text-sm text-muted-foreground">{person.order}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {person.photo ? (
                            /* <img> ไม่ใช่ next/image — URL มาจากโดเมนไหนก็ได้ที่แอดมินวางเอง */
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img
                              src={person.photo}
                              alt=""
                              className="size-10 shrink-0 rounded-full border border-border object-cover"
                            />
                          ) : (
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground">
                              <UserRound className="size-5" aria-hidden="true" />
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium">{person.name}</span>
                            <span className="text-xs text-muted-foreground">{person.position}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {person.department ?? "—"}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        <div className="flex flex-col gap-0.5">
                          {person.email && (
                            <span className="flex items-center gap-1">
                              <Mail className="size-3.5 shrink-0" aria-hidden="true" />
                              {person.email}
                            </span>
                          )}
                          {person.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                              {person.phone}
                            </span>
                          )}
                          {!person.email && !person.phone && "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        {person.isActive ? (
                          <Badge variant="default">แสดงอยู่</Badge>
                        ) : (
                          <Badge variant="secondary">ซ่อนอยู่</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <StaffRowActions id={person.id} name={person.name} isActive={person.isActive} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <TablePagination basePath="/admin/staff" params={{ q, active }} page={page} pageCount={pageCount} total={total} />
      </div>
    </>
  );
}
