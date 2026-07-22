import type { Metadata } from "next";
import Link from "next/link";
import { formatThaiDate } from "@/lib/date";
import { ImageOff, Plus, Star } from "lucide-react";
import { Prisma } from "@/lib/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { TableSearch } from "@/components/admin/table-search";
import { TablePagination } from "@/components/admin/table-pagination";
import { MediaWorkRowActions } from "@/components/admin/media-work-row-actions";
import { MEDIA_TYPES, MEDIA_TYPE_LABEL } from "@/lib/validations/media-work";
import { mediaWorkThumbnail } from "@/lib/media-work";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "ผลงาน / สื่อการสอน" };

const PAGE_SIZE = 10;

function isMediaType(value?: string): value is (typeof MEDIA_TYPES)[number] {
  return MEDIA_TYPES.includes(value as (typeof MEDIA_TYPES)[number]);
}

export default async function AdminWorksPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string; type?: string }>;
}) {
  await requireRole("SUPER_ADMIN", "ADMIN");
  const { q, page: pageParam, status, type } = await searchParams;

  const page = Math.max(1, Number(pageParam) || 1);
  const where: Prisma.MediaWorkWhereInput = {
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    ...(status === "DRAFT" || status === "PUBLISHED" ? { status } : {}),
    ...(isMediaType(type) ? { type } : {}),
  };

  const [total, works] = await Promise.all([
    prisma.mediaWork.count({ where }),
    prisma.mediaWork.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        slug: true,
        type: true,
        status: true,
        featured: true,
        createdAt: true,
        thumbnail: true,
        youtubeUrl: true,
        author: { select: { name: true } },
      },
    }),
  ]);

  const pageCount = Math.ceil(total / PAGE_SIZE);
  const hasFilter = Boolean(q || status || type);

  // ตัวกรองทุกตัวทำงานผ่าน URL — กด back ได้ แชร์ลิงก์ได้ (เหมือนหน้าข่าว)
  function filterHref(next: { status?: string; type?: string }) {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    const nextStatus = "status" in next ? next.status : status;
    const nextType = "type" in next ? next.type : type;
    if (nextStatus) params.set("status", nextStatus);
    if (nextType) params.set("type", nextType);
    return params.toString() ? `/admin/works?${params}` : "/admin/works";
  }

  return (
    <>
      <PageHeader
        title="ผลงาน / สื่อการสอน"
        description="คลิป YouTube ไฟล์วิดีโอ และบทความ"
        action={
          <Button nativeButton={false} render={<Link href="/admin/works/new" />}>
            <Plus aria-hidden="true" />
            สร้างผลงาน
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <TableSearch placeholder="ค้นหาจากชื่อผลงาน…" />

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
                render={<Link href={filterHref({ status: filter.value })} />}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          <div className="flex gap-1">
            {[{ label: "ทุกชนิด", value: undefined }, ...MEDIA_TYPES.map((t) => ({ label: MEDIA_TYPE_LABEL[t], value: t }))].map(
              (filter) => (
                <Button
                  key={filter.label}
                  variant={type === filter.value || (!type && !filter.value) ? "secondary" : "ghost"}
                  size="sm"
                  nativeButton={false}
                  render={<Link href={filterHref({ type: filter.value })} />}
                >
                  {filter.label}
                </Button>
              ),
            )}
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {works.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-12 text-center">
                <p className="font-medium">{hasFilter ? "ไม่พบผลงานที่ค้นหา" : "ยังไม่มีผลงาน"}</p>
                <p className="text-sm text-muted-foreground">
                  {hasFilter ? "ลองเปลี่ยนคำค้นหรือตัวกรอง" : "เริ่มจากกดปุ่ม “สร้างผลงาน” ด้านบน"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden w-24 sm:table-cell">รูปปก</TableHead>
                    <TableHead>ชื่อ</TableHead>
                    <TableHead className="hidden md:table-cell">ชนิด</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="hidden lg:table-cell">ผู้สร้าง</TableHead>
                    <TableHead className="hidden sm:table-cell">สร้างเมื่อ</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {works.map((work) => {
                    // รูปปกอัตโนมัติของ YouTube คำนวณตรงนี้ ไม่ได้เก็บใน DB (ดู lib/media-work.ts)
                    const thumbnail = mediaWorkThumbnail(work);
                    return (
                    <TableRow key={work.id}>
                      <TableCell className="hidden sm:table-cell">
                        {thumbnail ? (
                          /* <img> ไม่ใช่ next/image — URL มาจากโดเมนไหนก็ได้ที่แอดมินวางเอง */
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={thumbnail}
                            alt=""
                            className="h-10 w-16 rounded border border-border object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-16 items-center justify-center rounded border border-dashed border-border text-muted-foreground">
                            <ImageOff className="size-4" aria-label="ไม่มีรูปปก" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {work.featured && (
                            <Star className="size-3.5 shrink-0 fill-current text-amber-500" aria-label="ผลงานเด่น" />
                          )}
                          <span className="font-medium">{work.title}</span>
                        </div>
                        <span className="text-xs text-muted-foreground">/{work.slug}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline">{MEDIA_TYPE_LABEL[work.type]}</Badge>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={work.status} />
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {work.author?.name ?? <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {formatThaiDate(work.createdAt, "short")}
                      </TableCell>
                      <TableCell>
                        <MediaWorkRowActions id={work.id} title={work.title} status={work.status} />
                      </TableCell>
                    </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <TablePagination basePath="/admin/works" params={{ q, status, type }} page={page} pageCount={pageCount} total={total} />
      </div>
    </>
  );
}
