import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Plus } from "lucide-react";
import { Prisma } from "@/lib/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { TableSearch } from "@/components/admin/table-search";
import { TablePagination } from "@/components/admin/table-pagination";
import { AnnouncementRowActions } from "@/components/admin/announcement-row-actions";
import { announcementLiveState, formatAnnouncementWindow } from "@/lib/announcement";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "ประกาศด่วน" };

const PAGE_SIZE = 10;

const STATE_BADGE = {
  live: { label: "กำลังแสดง", variant: "default" as const },
  scheduled: { label: "รอถึงเวลา", variant: "secondary" as const },
  expired: { label: "หมดเวลา", variant: "outline" as const },
  hidden: { label: "ปิดอยู่", variant: "secondary" as const },
};

export default async function AdminAnnouncementsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; active?: string }>;
}) {
  await requireRole("SUPER_ADMIN", "ADMIN");
  const { q, page: pageParam, active } = await searchParams;

  const page = Math.max(1, Number(pageParam) || 1);
  const where: Prisma.AnnouncementWhereInput = {
    ...(q ? { message: { contains: q, mode: "insensitive" } } : {}),
    ...(active === "1" ? { isActive: true } : active === "0" ? { isActive: false } : {}),
  };

  const [total, announcements] = await Promise.all([
    prisma.announcement.count({ where }),
    prisma.announcement.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        message: true,
        linkUrl: true,
        isActive: true,
        startsAt: true,
        endsAt: true,
      },
    }),
  ]);

  const now = new Date();
  const pageCount = Math.ceil(total / PAGE_SIZE);
  const hasFilter = Boolean(q || active);

  function filterHref(nextActive?: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (nextActive) params.set("active", nextActive);
    return params.toString() ? `/admin/announcements?${params}` : "/admin/announcements";
  }

  return (
    <>
      <PageHeader
        title="ประกาศด่วน"
        description="แถบข้อความประชาสัมพันธ์ด้านบนสุดของหน้าแรก ตั้งช่วงเวลาแสดงได้"
        action={
          <Button nativeButton={false} render={<Link href="/admin/announcements/new" />}>
            <Plus aria-hidden="true" />
            เพิ่มประกาศ
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <TableSearch placeholder="ค้นหาจากข้อความประกาศ…" />
          <div className="flex gap-1">
            {[
              { label: "ทั้งหมด", value: undefined },
              { label: "เปิดอยู่", value: "1" },
              { label: "ปิดอยู่", value: "0" },
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
            {announcements.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-12 text-center">
                <p className="font-medium">{hasFilter ? "ไม่พบประกาศที่ค้นหา" : "ยังไม่มีประกาศ"}</p>
                <p className="text-sm text-muted-foreground">
                  {hasFilter ? "ลองเปลี่ยนคำค้นหรือตัวกรอง" : "เริ่มจากกดปุ่ม “เพิ่มประกาศ” ด้านบน"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ข้อความ</TableHead>
                    <TableHead className="hidden lg:table-cell">ช่วงเวลาแสดง</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {announcements.map((a) => {
                    const state = announcementLiveState(a.isActive, a.startsAt, a.endsAt, now);
                    const badge = STATE_BADGE[state];
                    return (
                      <TableRow key={a.id} className={a.isActive ? undefined : "opacity-60"}>
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span className="line-clamp-2 max-w-[420px] font-medium">{a.message}</span>
                            {a.linkUrl && (
                              <a
                                href={a.linkUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex max-w-[280px] items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                                title={a.linkUrl}
                              >
                                <ExternalLink className="size-3 shrink-0" aria-hidden="true" />
                                <span className="truncate">{a.linkUrl}</span>
                              </a>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          {formatAnnouncementWindow(a.startsAt, a.endsAt)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <AnnouncementRowActions id={a.id} label="ประกาศนี้" isActive={a.isActive} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <TablePagination
          basePath="/admin/announcements"
          params={{ q, active }}
          page={page}
          pageCount={pageCount}
          total={total}
        />
      </div>
    </>
  );
}
