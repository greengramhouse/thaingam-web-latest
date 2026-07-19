import type { Metadata } from "next";
import Link from "next/link";
import { Download, FileText, Plus } from "lucide-react";
import { Prisma } from "@/lib/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { StatusBadge } from "@/components/admin/status-badge";
import { TableSearch } from "@/components/admin/table-search";
import { TablePagination } from "@/components/admin/table-pagination";
import { DocumentRowActions } from "@/components/admin/document-row-actions";
import { documentFileLabel } from "@/lib/document";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "เอกสารดาวน์โหลด" };

const PAGE_SIZE = 10;

export default async function AdminDocumentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string }>;
}) {
  await requireRole("SUPER_ADMIN", "ADMIN");
  const { q, page: pageParam, status } = await searchParams;

  const page = Math.max(1, Number(pageParam) || 1);
  const where: Prisma.DocumentWhereInput = {
    ...(q
      ? {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { category: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(status === "DRAFT" || status === "PUBLISHED" ? { status } : {}),
  };

  const [total, documents] = await Promise.all([
    prisma.document.count({ where }),
    prisma.document.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        description: true,
        fileUrl: true,
        fileType: true,
        category: true,
        status: true,
        downloadCount: true,
      },
    }),
  ]);

  const pageCount = Math.ceil(total / PAGE_SIZE);
  const hasFilter = Boolean(q || status);

  return (
    <>
      <PageHeader
        title="เอกสารดาวน์โหลด"
        description="จัดการไฟล์ประกาศ แบบฟอร์ม และเอกสารสำหรับดาวน์โหลดในเว็บไซต์"
        action={
          <Button nativeButton={false} render={<Link href="/admin/documents/new" />}>
            <Plus aria-hidden="true" />
            เพิ่มเอกสาร
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <TableSearch placeholder="ค้นหาจากชื่อ รายละเอียด หรือหมวด…" />
          <div className="flex gap-1">
            {[
              { label: "ทั้งหมด", value: undefined },
              { label: "ร่าง", value: "DRAFT" },
              { label: "เผยแพร่แล้ว", value: "PUBLISHED" },
            ].map((filter) => {
              const params = new URLSearchParams();
              if (q) params.set("q", q);
              if (filter.value) params.set("status", filter.value);
              const href = params.toString() ? `/admin/documents?${params}` : "/admin/documents";
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
            {documents.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-12 text-center">
                <p className="font-medium">{hasFilter ? "ไม่พบเอกสารที่ค้นหา" : "ยังไม่มีเอกสาร"}</p>
                <p className="text-sm text-muted-foreground">
                  {hasFilter ? "ลองเปลี่ยนคำค้นหรือตัวกรอง" : "เริ่มจากกดปุ่ม “เพิ่มเอกสาร” ด้านบน"}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อเอกสาร</TableHead>
                    <TableHead className="hidden md:table-cell">หมวด</TableHead>
                    <TableHead className="hidden sm:table-cell">ชนิดไฟล์</TableHead>
                    <TableHead className="hidden lg:table-cell text-right">ดาวน์โหลด</TableHead>
                    <TableHead>สถานะ</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate font-medium">{doc.title}</span>
                            {doc.description && (
                              <span className="truncate text-xs text-muted-foreground">{doc.description}</span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {doc.category ? (
                          <Badge variant="secondary">{doc.category}</Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                        {documentFileLabel(doc.fileType, doc.fileUrl)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-right text-sm text-muted-foreground tabular-nums">
                        <span className="inline-flex items-center gap-1">
                          <Download className="size-3.5 shrink-0" aria-hidden="true" />
                          {doc.downloadCount}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={doc.status} />
                      </TableCell>
                      <TableCell>
                        <DocumentRowActions id={doc.id} title={doc.title} status={doc.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <TablePagination
          basePath="/admin/documents"
          params={{ q, status }}
          page={page}
          pageCount={pageCount}
          total={total}
        />
      </div>
    </>
  );
}
