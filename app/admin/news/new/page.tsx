import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { NewsForm } from "@/components/admin/news-form";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "สร้างข่าว" };

export default async function NewNewsPage() {
  await requireRole("SUPER_ADMIN", "ADMIN");

  const [categories, tags] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.tag.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  return (
    <>
      <PageHeader title="สร้างข่าว" description="เขียนข่าวใหม่ — บันทึกเป็นร่างก่อนได้ ค่อยกดเผยแพร่ทีหลัง" />
      <NewsForm categories={categories} tags={tags} />
    </>
  );
}
