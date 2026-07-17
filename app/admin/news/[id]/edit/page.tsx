import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { NewsForm } from "@/components/admin/news-form";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "แก้ไขข่าว" };

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("SUPER_ADMIN", "ADMIN");
  const { id } = await params;

  const [news, categories, tags] = await Promise.all([
    prisma.news.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        content: true,
        coverImage: true,
        categoryId: true,
        featured: true,
        status: true,
        tags: { select: { id: true } },
      },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.tag.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!news) notFound();

  return (
    <>
      <PageHeader title="แก้ไขข่าว" description={news.title} />
      <NewsForm
        categories={categories}
        tags={tags}
        news={{
          id: news.id,
          title: news.title,
          slug: news.slug,
          // ฟอร์มใช้ "" แทน null (input ควบคุมค่าไม่ได้ถ้าเป็น null)
          excerpt: news.excerpt ?? "",
          content: news.content,
          coverImage: news.coverImage ?? "",
          categoryId: news.categoryId ?? "",
          tagIds: news.tags.map((tag) => tag.id),
          featured: news.featured,
          status: news.status,
        }}
      />
    </>
  );
}
