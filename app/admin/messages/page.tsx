import type { Metadata } from "next";
import Link from "next/link";
import { formatThaiDate } from "@/lib/date";
import { Prisma } from "@/lib/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { TableSearch } from "@/components/admin/table-search";
import { TablePagination } from "@/components/admin/table-pagination";
import { MessageRowActions } from "@/components/admin/message-row-actions";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "ข้อความติดต่อ" };

const PAGE_SIZE = 10;

export default async function AdminMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; read?: string }>;
}) {
  await requireRole("SUPER_ADMIN", "ADMIN");
  const { q, page: pageParam, read } = await searchParams;

  const page = Math.max(1, Number(pageParam) || 1);
  const where: Prisma.ContactMessageWhereInput = {
    ...(q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { subject: { contains: q, mode: "insensitive" } },
            { message: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(read === "1" ? { isRead: true } : read === "0" ? { isRead: false } : {}),
  };

  const [total, unreadCount, messages] = await Promise.all([
    prisma.contactMessage.count({ where }),
    prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.contactMessage.findMany({
      where,
      // ยังไม่อ่านขึ้นก่อน แล้วใหม่สุดก่อน
      orderBy: [{ isRead: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        message: true,
        isRead: true,
        createdAt: true,
      },
    }),
  ]);

  const pageCount = Math.ceil(total / PAGE_SIZE);
  const hasFilter = Boolean(q || read);

  function filterHref(nextRead?: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (nextRead) params.set("read", nextRead);
    return params.toString() ? `/admin/messages?${params}` : "/admin/messages";
  }

  return (
    <>
      <PageHeader
        title="ข้อความติดต่อ"
        description={
          unreadCount > 0 ? `มีข้อความยังไม่ได้อ่าน ${unreadCount} รายการ` : "ข้อความจากฟอร์มติดต่อบนหน้าเว็บ"
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <TableSearch placeholder="ค้นหาจากชื่อ อีเมล หัวข้อ หรือข้อความ…" />
          <div className="flex gap-1">
            {[
              { label: "ทั้งหมด", value: undefined },
              { label: "ยังไม่อ่าน", value: "0" },
              { label: "อ่านแล้ว", value: "1" },
            ].map((filter) => (
              <Button
                key={filter.label}
                variant={read === filter.value || (!read && !filter.value) ? "secondary" : "ghost"}
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
            {messages.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-12 text-center">
                <p className="font-medium">{hasFilter ? "ไม่พบข้อความที่ค้นหา" : "ยังไม่มีข้อความติดต่อ"}</p>
                <p className="text-sm text-muted-foreground">
                  {hasFilter ? "ลองเปลี่ยนคำค้นหรือตัวกรอง" : "ข้อความจากฟอร์มติดต่อบนหน้าเว็บจะแสดงที่นี่"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ผู้ส่ง</TableHead>
                    <TableHead>เรื่อง / ข้อความ</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="hidden sm:table-cell">ส่งเมื่อ</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((m) => (
                    <TableRow key={m.id} className={m.isRead ? undefined : "bg-muted/40"}>
                      <TableCell>
                        <Link href={`/admin/messages/${m.id}`} className="hover:underline">
                          <span className={m.isRead ? "font-medium" : "font-semibold"}>{m.name}</span>
                        </Link>
                        <span className="block text-xs text-muted-foreground">{m.email}</span>
                      </TableCell>
                      <TableCell>
                        <Link href={`/admin/messages/${m.id}`} className="block max-w-[360px] hover:underline">
                          {m.subject && <span className="line-clamp-1 font-medium">{m.subject}</span>}
                          <span className="line-clamp-1 text-sm text-muted-foreground">{m.message}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        {m.isRead ? (
                          <Badge variant="secondary">อ่านแล้ว</Badge>
                        ) : (
                          <Badge variant="default">ใหม่</Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {formatThaiDate(m.createdAt, "short")}
                      </TableCell>
                      <TableCell>
                        <MessageRowActions id={m.id} label={`ข้อความจาก ${m.name}`} isRead={m.isRead} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <TablePagination
          basePath="/admin/messages"
          params={{ q, read }}
          page={page}
          pageCount={pageCount}
          total={total}
        />
      </div>
    </>
  );
}
