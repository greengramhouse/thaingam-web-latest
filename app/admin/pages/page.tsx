import type { Metadata } from "next";
import Link from "next/link";
import { formatThaiDate } from "@/lib/date";
import { Plus } from "lucide-react";
import { Prisma } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { TableSearch } from "@/components/admin/table-search";
import { TablePagination } from "@/components/admin/table-pagination";
import { PageRowActions } from "@/components/admin/page-row-actions";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "หน้าเนื้อหา" };

const PAGE_SIZE = 10;

export default async function AdminPagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  await requireRole("SUPER_ADMIN", "ADMIN");
  const { q, page: pageParam, status } = await searchParams;

  const page = Math.max(1, Number(pageParam) || 1);
  const where: Prisma.PageWhereInput = {
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    ...(status === "DRAFT" || status === "PUBLISHED" ? { status } : {}),
  };

  const [total, pages] = await Promise.all([
    prisma.page.count({ where }),
    prisma.page.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        author: { select: { name: true } },
      },
    }),
  ]);

  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <PageHeader
        title="หน้าเนื้อหา"
        description="หน้าคงที่ที่แก้ผ่านแอดมิน เช่น ระเบียบ หลักสูตร ประวัติโรงเรียน"
        action={
          <Button nativeButton={false} render={<Link href="/admin/pages/new" />}>
            <Plus aria-hidden="true" />
            สร้างหน้า
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <TableSearch placeholder="ค้นหาจากชื่อหน้า…" />
          <div className="flex gap-1">
            {[
              { label: "ทั้งหมด", value: undefined },
              { label: "ร่าง", value: "DRAFT" },
              { label: "เผยแพร่แล้ว", value: "PUBLISHED" },
            ].map((filter) => {
              const params = new URLSearchParams();
              if (q) params.set("q", q);
              if (filter.value) params.set("status", filter.value);
              const href = params.toString() ? `/admin/pages?${params}` : "/admin/pages";
              const active = status === filter.value || (!status && !filter.value);
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
            })}
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {pages.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-12 text-center">
                <p className="font-medium">{q || status ? "ไม่พบหน้าที่ค้นหา" : "ยังไม่มีหน้าเนื้อหา"}</p>
                <p className="text-sm text-muted-foreground">
                  {q || status ? "ลองเปลี่ยนคำค้นหรือตัวกรอง" : "เริ่มจากกดปุ่ม “สร้างหน้า” ด้านบน"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อหน้า</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="hidden lg:table-cell">แก้ไขล่าสุดโดย</TableHead>
                    <TableHead className="hidden sm:table-cell">แก้ไขเมื่อ</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <span className="font-medium">{item.title}</span>
                        <span className="block text-xs text-muted-foreground">/{item.slug}</span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {item.author?.name ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {formatThaiDate(item.updatedAt, "short")}
                      </TableCell>
                      <TableCell>
                        <PageRowActions id={item.id} label={`“${item.title}”`} published={item.status === "PUBLISHED"} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <TablePagination
          basePath="/admin/pages"
          params={{ q, status }}
          page={page}
          pageCount={pageCount}
          total={total}
        />
      </div>
    </>
  );
}
