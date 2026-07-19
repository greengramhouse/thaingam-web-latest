import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, ImageIcon, Plus } from "lucide-react";
import { Prisma } from "@/lib/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { TableSearch } from "@/components/admin/table-search";
import { TablePagination } from "@/components/admin/table-pagination";
import { BannerRowActions } from "@/components/admin/banner-row-actions";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "แบนเนอร์หน้าแรก" };

const PAGE_SIZE = 10;

export default async function AdminBannersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; active?: string }>;
}) {
  await requireRole("SUPER_ADMIN", "ADMIN");
  const { q, page: pageParam, active } = await searchParams;

  const page = Math.max(1, Number(pageParam) || 1);
  const where: Prisma.BannerWhereInput = {
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    ...(active === "1" ? { isActive: true } : active === "0" ? { isActive: false } : {}),
  };

  const [total, banners] = await Promise.all([
    prisma.banner.count({ where }),
    prisma.banner.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: { id: true, title: true, image: true, linkUrl: true, order: true, isActive: true },
    }),
  ]);

  const pageCount = Math.ceil(total / PAGE_SIZE);
  const hasFilter = Boolean(q || active);

  function filterHref(nextActive?: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (nextActive) params.set("active", nextActive);
    return params.toString() ? `/admin/banners?${params}` : "/admin/banners";
  }

  return (
    <>
      <PageHeader
        title="แบนเนอร์หน้าแรก"
        description="ภาพสไลด์ Hero บนหน้าแรกของเว็บไซต์ (เรียงตามลำดับที่ตั้ง)"
        action={
          <Button nativeButton={false} render={<Link href="/admin/banners/new" />}>
            <Plus aria-hidden="true" />
            เพิ่มแบนเนอร์
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <TableSearch placeholder="ค้นหาจากชื่อแบนเนอร์…" />
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
            {banners.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-12 text-center">
                <p className="font-medium">{hasFilter ? "ไม่พบแบนเนอร์ที่ค้นหา" : "ยังไม่มีแบนเนอร์"}</p>
                <p className="text-sm text-muted-foreground">
                  {hasFilter ? "ลองเปลี่ยนคำค้นหรือตัวกรอง" : "เริ่มจากกดปุ่ม “เพิ่มแบนเนอร์” ด้านบน"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">ลำดับ</TableHead>
                    <TableHead>แบนเนอร์</TableHead>
                    <TableHead className="hidden lg:table-cell">ลิงก์</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {banners.map((banner) => (
                    <TableRow key={banner.id} className={banner.isActive ? undefined : "opacity-60"}>
                      <TableCell className="text-center text-sm text-muted-foreground tabular-nums">
                        {banner.order}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {/* <img> ไม่ใช่ next/image — URL มาจากโดเมนไหนก็ได้ที่แอดมินวางเอง */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={banner.image}
                            alt=""
                            className="h-10 w-20 shrink-0 rounded border border-border bg-muted object-cover"
                          />
                          <span className="min-w-0">
                            {banner.title ? (
                              <span className="line-clamp-1 font-medium">{banner.title}</span>
                            ) : (
                              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                                <ImageIcon className="size-3.5 shrink-0" aria-hidden="true" />
                                ภาพไม่มีชื่อ
                              </span>
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {banner.linkUrl ? (
                          <a
                            href={banner.linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex max-w-[220px] items-center gap-1 hover:text-foreground"
                            title={banner.linkUrl}
                          >
                            <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                            <span className="truncate">{banner.linkUrl}</span>
                          </a>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        {banner.isActive ? (
                          <Badge variant="default">แสดงอยู่</Badge>
                        ) : (
                          <Badge variant="secondary">ซ่อนอยู่</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <BannerRowActions
                          id={banner.id}
                          label={banner.title ? `“${banner.title}”` : "แบนเนอร์นี้"}
                          isActive={banner.isActive}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <TablePagination basePath="/admin/banners" params={{ q, active }} page={page} pageCount={pageCount} total={total} />
      </div>
    </>
  );
}
