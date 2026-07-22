import type { Metadata } from "next";
import Link from "next/link";
import { formatThaiDate } from "@/lib/date";
import { Plus, Star } from "lucide-react";
import { Prisma } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { TableSearch } from "@/components/admin/table-search";
import { TablePagination } from "@/components/admin/table-pagination";
import { NewsRowActions } from "@/components/admin/news-row-actions";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "ข่าวสาร" };

const PAGE_SIZE = 10;

export default async function AdminNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  await requireRole("SUPER_ADMIN", "ADMIN");
  const { q, page: pageParam, status } = await searchParams;

  const page = Math.max(1, Number(pageParam) || 1);
  const where: Prisma.NewsWhereInput = {
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    ...(status === "DRAFT" || status === "PUBLISHED" ? { status } : {}),
  };

  const [total, news] = await Promise.all([
    prisma.news.count({ where }),
    prisma.news.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        featured: true,
        createdAt: true,
        category: { select: { name: true } },
        author: { select: { name: true } },
      },
    }),
  ]);

  const pageCount = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <PageHeader
        title="ข่าวสาร"
        description="จัดการข่าวประชาสัมพันธ์ของโรงเรียน"
        action={
          <Button nativeButton={false} render={<Link href="/admin/news/new" />}>
            <Plus aria-hidden="true" />
            สร้างข่าว
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <TableSearch placeholder="ค้นหาจากหัวข้อข่าว…" />
          <div className="flex gap-1">
            {[
              { label: "ทั้งหมด", value: undefined },
              { label: "ร่าง", value: "DRAFT" },
              { label: "เผยแพร่แล้ว", value: "PUBLISHED" },
            ].map((filter) => {
              const params = new URLSearchParams();
              if (q) params.set("q", q);
              if (filter.value) params.set("status", filter.value);
              const href = params.toString() ? `/admin/news?${params}` : "/admin/news";
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
            {news.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-12 text-center">
                <p className="font-medium">{q || status ? "ไม่พบข่าวที่ค้นหา" : "ยังไม่มีข่าว"}</p>
                <p className="text-sm text-muted-foreground">
                  {q || status ? "ลองเปลี่ยนคำค้นหรือตัวกรอง" : "เริ่มจากกดปุ่ม “สร้างข่าว” ด้านบน"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>หัวข้อ</TableHead>
                    <TableHead className="hidden md:table-cell">หมวดหมู่</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="hidden lg:table-cell">ผู้เขียน</TableHead>
                    <TableHead className="hidden sm:table-cell">สร้างเมื่อ</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {news.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {item.featured && (
                            <Star className="size-3.5 shrink-0 fill-current text-amber-500" aria-label="ข่าวเด่น" />
                          )}
                          <span className="font-medium">{item.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">/{item.slug}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {item.category?.name ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {item.author?.name ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {formatThaiDate(item.createdAt, "short")}
                      </TableCell>
                      <TableCell>
                        <NewsRowActions id={item.id} title={item.title} status={item.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <TablePagination
          basePath="/admin/news"
          params={{ q, status }}
          page={page}
          pageCount={pageCount}
          total={total}
        />
      </div>
    </>
  );
}
