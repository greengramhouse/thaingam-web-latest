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
import { StaffRowActions } from "@/components/admin/staff-row-actions";
import { DepartmentMoveButtons, StaffMoveButtons } from "@/components/admin/staff-move-buttons";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { groupStaffByDepartment } from "@/lib/staff";

export const metadata: Metadata = { title: "ทำเนียบบุคลากร" };

export default async function AdminStaffPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; active?: string }>;
}) {
  await requireRole("SUPER_ADMIN", "ADMIN");
  const { q, active } = await searchParams;

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

  /**
   * ⚠️ **ไม่มี pagination โดยตั้งใจ** — หน้านี้คือที่ที่แอดมินจัดลำดับด้วยปุ่ม ▲▼
   * ถ้าตัดหน้า คนที่อยู่ท้ายหน้า 1 จะกดเลื่อนลงแล้วหายไปหน้า 2 ทันที (งงมาก)
   * ทำเนียบโรงเรียนมีระดับสิบกว่า–ร้อยคน โหลดทีเดียวไม่หนัก · ถ้าโตเกินค่อยกลับมาคิดใหม่
   */
  const [staff, departments] = await Promise.all([
    prisma.staff.findMany({
      where,
      // ตรงกับหน้าเว็บสาธารณะ — order มีความหมายภายในกลุ่มตัวเอง (ดู schema.prisma)
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        position: true,
        department: true,
        photo: true,
        email: true,
        phone: true,
        isActive: true,
      },
    }),
    prisma.staffDepartment.findMany({ select: { name: true, order: true } }),
  ]);

  const groups = groupStaffByDepartment(staff, new Map(departments.map((d) => [d.name, d.order])));
  // กลุ่ม "บุคลากรอื่น ๆ" (key = null) ตรึงล่างสุด เลื่อนไม่ได้ → ไม่นับเป็นกลุ่มที่ขยับได้
  const movableGroups = groups.filter((g) => g.key !== null).length;

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
        description="เรียงตามที่เห็นในหน้านี้เป๊ะ ๆ — ใช้ปุ่มลูกศรจัดลำดับกลุ่มและคนในกลุ่ม"
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

        {hasFilter && staff.length > 0 && (
          <p className="text-sm text-muted-foreground">
            กำลังกรองอยู่ — ปุ่มจัดลำดับถูกปิดไว้ เพราะลำดับที่เห็นตอนกรองไม่ใช่ลำดับจริงบนหน้าเว็บ
            <Link href="/admin/staff" className="ml-1 font-medium text-primary underline-offset-4 hover:underline">
              ล้างตัวกรอง
            </Link>
          </p>
        )}

        {groups.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 p-12 text-center">
              <p className="font-medium">{hasFilter ? "ไม่พบบุคลากรที่ค้นหา" : "ยังไม่มีบุคลากร"}</p>
              <p className="text-sm text-muted-foreground">
                {hasFilter ? "ลองเปลี่ยนคำค้นหรือตัวกรอง" : "เริ่มจากกดปุ่ม “เพิ่มบุคลากร” ด้านบน"}
              </p>
            </CardContent>
          </Card>
        ) : (
          groups.map((group, gi) => (
            <Card key={group.key ?? "__other"}>
              <CardContent className="p-0">
                <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                  <div className="flex flex-col">
                    <h2 className="font-semibold">{group.label}</h2>
                    <p className="text-xs text-muted-foreground">
                      {group.key === null
                        ? `${group.members.length} คน · ไม่ได้กรอกฝ่าย — กลุ่มนี้อยู่ล่างสุดของหน้าเว็บเสมอ`
                        : `${group.members.length} คน`}
                    </p>
                  </div>
                  {group.key !== null && !hasFilter && (
                    <DepartmentMoveButtons
                      name={group.key}
                      isFirst={gi === 0}
                      isLast={gi === movableGroups - 1}
                    />
                  )}
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      {!hasFilter && <TableHead className="w-20">ลำดับ</TableHead>}
                      <TableHead>ชื่อ–ตำแหน่ง</TableHead>
                      <TableHead className="hidden lg:table-cell">ติดต่อ</TableHead>
                      <TableHead>สถานะ</TableHead>
                      <TableHead className="text-right">จัดการ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.members.map((person, mi) => (
                      <TableRow key={person.id} className={person.isActive ? undefined : "opacity-60"}>
                        {!hasFilter && (
                          <TableCell className="py-1">
                            <StaffMoveButtons
                              id={person.id}
                              name={person.name}
                              isFirst={mi === 0}
                              isLast={mi === group.members.length - 1}
                            />
                          </TableCell>
                        )}
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
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
