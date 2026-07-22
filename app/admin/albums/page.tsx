import type { Metadata } from "next";
import Link from "next/link";
import { formatThaiDate } from "@/lib/date";
import { Heart, ImageOff, Images, Plus } from "lucide-react";
import { Prisma } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { TableSearch } from "@/components/admin/table-search";
import { TablePagination } from "@/components/admin/table-pagination";
import { AlbumRowActions } from "@/components/admin/album-row-actions";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "อัลบั้มภาพ" };

const PAGE_SIZE = 10;

export default async function AdminAlbumsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  await requireRole("SUPER_ADMIN", "ADMIN");
  const { q, page: pageParam, status } = await searchParams;

  const page = Math.max(1, Number(pageParam) || 1);
  const where: Prisma.AlbumWhereInput = {
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    ...(status === "DRAFT" || status === "PUBLISHED" ? { status } : {}),
  };

  const [total, albums] = await Promise.all([
    prisma.album.count({ where }),
    prisma.album.findMany({
      where,
      orderBy: [{ eventDate: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        slug: true,
        coverImage: true,
        eventDate: true,
        status: true,
        likeCount: true,
        _count: { select: { photos: true } },
        // สำรองรูปปกจากรูปแรกในอัลบั้ม ถ้ายังไม่ตั้ง coverImage
        photos: { take: 1, orderBy: { order: "asc" }, select: { url: true } },
      },
    }),
  ]);

  const pageCount = Math.ceil(total / PAGE_SIZE);
  const hasFilter = Boolean(q || status);

  function filterHref(nextStatus?: string) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (nextStatus) params.set("status", nextStatus);
    return params.toString() ? `/admin/albums?${params}` : "/admin/albums";
  }

  return (
    <>
      <PageHeader
        title="อัลบั้มภาพ"
        description="รวมภาพกิจกรรมของโรงเรียน แสดงในหน้าอัลบั้มสาธารณะ"
        action={
          <Button nativeButton={false} render={<Link href="/admin/albums/new" />}>
            <Plus aria-hidden="true" />
            สร้างอัลบั้ม
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <TableSearch placeholder="ค้นหาจากชื่ออัลบั้ม…" />

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
            {albums.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-12 text-center">
                <p className="font-medium">{hasFilter ? "ไม่พบอัลบั้มที่ค้นหา" : "ยังไม่มีอัลบั้ม"}</p>
                <p className="text-sm text-muted-foreground">
                  {hasFilter ? "ลองเปลี่ยนคำค้นหรือตัวกรอง" : "เริ่มจากกดปุ่ม “สร้างอัลบั้ม” ด้านบน"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden w-24 sm:table-cell">รูปปก</TableHead>
                    <TableHead>ชื่ออัลบั้ม</TableHead>
                    <TableHead className="hidden md:table-cell">จำนวนรูป</TableHead>
                    <TableHead className="hidden lg:table-cell">ไลก์</TableHead>
                    <TableHead className="hidden md:table-cell">วันที่จัด</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {albums.map((album) => {
                    const cover = album.coverImage ?? album.photos[0]?.url ?? null;
                    return (
                      <TableRow key={album.id}>
                        <TableCell className="hidden sm:table-cell">
                          {cover ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={cover} alt="" className="h-10 w-16 rounded border border-border object-cover" />
                          ) : (
                            <div className="flex h-10 w-16 items-center justify-center rounded border border-dashed border-border text-muted-foreground">
                              <ImageOff className="size-4" aria-label="ไม่มีรูปปก" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{album.title}</span>
                          <span className="block text-xs text-muted-foreground">/{album.slug}</span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Images className="size-3.5" aria-hidden="true" />
                            {album._count.photos}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Heart className="size-3.5" aria-hidden="true" />
                            {album.likeCount}
                          </span>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          {album.eventDate ? formatThaiDate(album.eventDate, "short") : "—"}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={album.status} />
                        </TableCell>
                        <TableCell>
                          <AlbumRowActions id={album.id} title={album.title} status={album.status} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <TablePagination basePath="/admin/albums" params={{ q, status }} page={page} pageCount={pageCount} total={total} />
      </div>
    </>
  );
}
