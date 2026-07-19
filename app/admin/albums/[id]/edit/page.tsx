import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { AlbumForm } from "@/components/admin/album-form";
import { AlbumPhotosManager } from "@/components/admin/album-photos-manager";
import { eventDateInputValue } from "@/lib/event";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "แก้ไขอัลบั้ม" };

export default async function EditAlbumPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("SUPER_ADMIN", "ADMIN");
  const { id } = await params;

  const album = await prisma.album.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      coverImage: true,
      eventDate: true,
      status: true,
      photos: {
        orderBy: { order: "asc" },
        select: { id: true, url: true, caption: true, order: true },
      },
    },
  });

  if (!album) notFound();

  return (
    <>
      <PageHeader title="แก้ไขอัลบั้ม" description={album.title} />
      <div className="flex flex-col gap-6">
        <AlbumForm
          album={{
            id: album.id,
            title: album.title,
            slug: album.slug,
            // ฟอร์มใช้ "" แทน null
            description: album.description ?? "",
            coverImage: album.coverImage ?? "",
            eventDate: eventDateInputValue(album.eventDate, true),
            status: album.status,
          }}
        />
        <AlbumPhotosManager albumId={album.id} photos={album.photos} />
      </div>
    </>
  );
}
