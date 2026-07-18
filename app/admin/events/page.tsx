import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, MapPin, Plus } from "lucide-react";
import { Prisma } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { TableSearch } from "@/components/admin/table-search";
import { TablePagination } from "@/components/admin/table-pagination";
import { EventRowActions } from "@/components/admin/event-row-actions";
import { formatEventRange } from "@/lib/event";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "กิจกรรม & ปฏิทิน" };

const PAGE_SIZE = 10;

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  await requireRole("SUPER_ADMIN", "ADMIN");
  const { q, page: pageParam, status } = await searchParams;

  const page = Math.max(1, Number(pageParam) || 1);
  const where: Prisma.EventWhereInput = {
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    ...(status === "DRAFT" || status === "PUBLISHED" ? { status } : {}),
  };

  const [total, events] = await Promise.all([
    prisma.event.count({ where }),
    prisma.event.findMany({
      where,
      // เรียงตามวันเริ่ม ล่าสุด/กำลังจะถึงก่อน (จัดการง่ายกว่าเรียงตามวันสร้าง)
      orderBy: { startDate: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        location: true,
        startDate: true,
        endDate: true,
        allDay: true,
        color: true,
        status: true,
        author: { select: { name: true } },
      },
    }),
  ]);

  const pageCount = Math.ceil(total / PAGE_SIZE);
  const hasFilter = Boolean(q || status);

  function filterHref(nextStatus?: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (nextStatus) params.set("status", nextStatus);
    return params.toString() ? `/admin/events?${params}` : "/admin/events";
  }

  return (
    <>
      <PageHeader
        title="กิจกรรม & ปฏิทิน"
        description="กิจกรรมของโรงเรียน แสดงในหน้าปฏิทินสาธารณะ"
        action={
          <Button nativeButton={false} render={<Link href="/admin/events/new" />}>
            <Plus aria-hidden="true" />
            สร้างกิจกรรม
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <TableSearch placeholder="ค้นหาจากชื่อกิจกรรม…" />

          <div className="flex gap-1">
            {[
              { label: "ทั้งหมด", value: undefined },
              { label: "ร่าง", value: "DRAFT" },
              { label: "เผยแพร่แล้ว", value: "PUBLISHED" },
            ].map((filter) => (
              <Button
                key={filter.label}
                variant={status === filter.value || (!status && !filter.value) ? "secondary" : "ghost"}
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
            {events.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-12 text-center">
                <p className="font-medium">{hasFilter ? "ไม่พบกิจกรรมที่ค้นหา" : "ยังไม่มีกิจกรรม"}</p>
                <p className="text-sm text-muted-foreground">
                  {hasFilter ? "ลองเปลี่ยนคำค้นหรือตัวกรอง" : "เริ่มจากกดปุ่ม “สร้างกิจกรรม” ด้านบน"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อ</TableHead>
                    <TableHead className="hidden md:table-cell">วันและเวลา</TableHead>
                    <TableHead className="hidden lg:table-cell">สถานที่</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="hidden lg:table-cell">ผู้สร้าง</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            aria-hidden="true"
                            className="size-2.5 shrink-0 rounded-full border border-border"
                            style={{ backgroundColor: event.color ?? "transparent" }}
                          />
                          <span className="font-medium">{event.title}</span>
                        </div>
                        {/* วันและเวลาโชว์ใต้ชื่อบนจอเล็กที่ซ่อนคอลัมน์ */}
                        <span className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground md:hidden">
                          <CalendarClock className="size-3" aria-hidden="true" />
                          {formatEventRange(event.startDate, event.endDate, event.allDay)}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm">
                        {formatEventRange(event.startDate, event.endDate, event.allDay)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                        {event.location ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                            {event.location}
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={event.status} />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {event.author?.name ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell>
                        <EventRowActions id={event.id} title={event.title} status={event.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <TablePagination basePath="/admin/events" params={{ q, status }} page={page} pageCount={pageCount} total={total} />
      </div>
    </>
  );
}
