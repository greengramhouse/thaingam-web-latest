import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { MediaWorkForm } from "@/components/admin/media-work-form";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "แก้ไขผลงาน" };

export default async function EditMediaWorkPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("SUPER_ADMIN", "ADMIN");
  const { id } = await params;

  const [work, tags] = await Promise.all([
    prisma.mediaWork.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        type: true,
        youtubeUrl: true,
        videoUrl: true,
        content: true,
        thumbnail: true,
        featured: true,
        status: true,
        tags: { select: { id: true } },
      },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  if (!work) notFound();

  return (
    <>
      <PageHeader title="แก้ไขผลงาน" description={work.title} />
      <MediaWorkForm
        tags={tags}
        work={{
          id: work.id,
          title: work.title,
          slug: work.slug,
          // ฟอร์มใช้ "" แทน null (input ควบคุมค่าไม่ได้ถ้าเป็น null)
          description: work.description ?? "",
          type: work.type,
          youtubeUrl: work.youtubeUrl ?? "",
          videoUrl: work.videoUrl ?? "",
          content: work.content ?? "",
          thumbnail: work.thumbnail ?? "",
          tagIds: work.tags.map((tag) => tag.id),
          featured: work.featured,
          status: work.status,
        }}
      />
    </>
  );
}
