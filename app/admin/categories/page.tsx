import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PageHeader } from "@/components/admin/page-header";
import { TaxonomyAddButton } from "@/components/admin/taxonomy-add-button";
import { TaxonomyRowActions } from "@/components/admin/taxonomy-row-actions";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "หมวดหมู่ & แท็ก" };

/**
 * หมวดหมู่กับแท็กอยู่หน้าเดียวกัน (ตามเมนู spec §5) — ทั้งคู่เป็นข้อมูลตั้งค่าเล็ก ๆ
 * ที่มีไม่กี่รายการ เลยไม่ต้องมี search/pagination แบบหน้าข่าว
 */
export default async function AdminCategoriesPage() {
  await requireRole("SUPER_ADMIN", "ADMIN");

  const [categories, tags] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        _count: { select: { news: true } },
      },
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, _count: { select: { news: true } } },
    }),
  ]);

  return (
    <>
      <PageHeader title="หมวดหมู่ & แท็ก" description="จัดการหมวดหมู่และแท็กที่ใช้จัดกลุ่มข่าวสาร" />

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <CardTitle className="text-base">หมวดหมู่</CardTitle>
              <CardDescription>ข่าว 1 ข่าวเลือกได้ 1 หมวดหมู่</CardDescription>
            </div>
            <TaxonomyAddButton kind="category" size="sm" />
          </CardHeader>
          <CardContent className="p-0">
            {categories.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-12 text-center">
                <p className="font-medium">ยังไม่มีหมวดหมู่</p>
                <p className="text-sm text-muted-foreground">เริ่มจากกดปุ่ม “เพิ่มหมวดหมู่” ด้านบน</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อ</TableHead>
                    <TableHead className="hidden md:table-cell">คำอธิบาย</TableHead>
                    <TableHead className="text-right">ข่าวที่ใช้</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <span className="font-medium">{category.name}</span>
                        <span className="block text-xs text-muted-foreground">/{category.slug}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {category.description || "—"}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {category._count.news}
                      </TableCell>
                      <TableCell>
                        <TaxonomyRowActions kind="category" item={category} newsCount={category._count.news} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <CardTitle className="text-base">แท็ก</CardTitle>
              <CardDescription>ข่าว 1 ข่าวติดได้หลายแท็ก</CardDescription>
            </div>
            <TaxonomyAddButton kind="tag" size="sm" />
          </CardHeader>
          <CardContent className="p-0">
            {tags.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-12 text-center">
                <p className="font-medium">ยังไม่มีแท็ก</p>
                <p className="text-sm text-muted-foreground">
                  เพิ่มแท็กแล้วจะเลือกใช้ได้ในฟอร์มเขียนข่าวทันที
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ชื่อ</TableHead>
                    <TableHead className="text-right">ข่าวที่ใช้</TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tags.map((tag) => (
                    <TableRow key={tag.id}>
                      <TableCell>
                        <span className="font-medium">{tag.name}</span>
                        <span className="block text-xs text-muted-foreground">/{tag.slug}</span>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {tag._count.news}
                      </TableCell>
                      <TableCell>
                        <TaxonomyRowActions kind="tag" item={tag} newsCount={tag._count.news} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
