"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/image-upload";
import { SubmitButton } from "@/components/admin/submit-button";
import { albumFormSchema, type AlbumFormValues } from "@/lib/validations/album";
import { createAlbum, updateAlbum } from "@/server/actions/album";

export function AlbumForm({ album }: { album?: AlbumFormValues & { id: string } }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AlbumFormValues>({
    resolver: standardSchemaResolver(albumFormSchema),
    defaultValues: album ?? {
      title: "",
      slug: "",
      description: "",
      coverImage: "",
      eventDate: "",
      status: "PUBLISHED",
    },
  });

  async function onSubmit(values: AlbumFormValues) {
    setServerError(null);
    const result = album ? await updateAlbum(album.id, values) : await createAlbum(values);

    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) setError(field as keyof AlbumFormValues, { message: messages[0] });
        }
      }
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    if (album) {
      toast.success("บันทึกการแก้ไขแล้ว");
      router.push("/admin/albums");
    } else {
      // สร้างเสร็จ → ไปหน้าแก้ไขทันทีเพื่อเพิ่มรูป (Photo ต้องมี albumId ก่อน)
      toast.success("สร้างอัลบั้มแล้ว — เพิ่มรูปได้เลย");
      router.push(`/admin/albums/${result.id}/edit`);
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3" noValidate>
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">ชื่ออัลบั้ม</Label>
              <Input id="title" aria-invalid={!!errors.title} {...register("title")} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="slug">slug (ตั้งเอง เป็นภาษาอังกฤษ)</Label>
              <Input id="slug" placeholder="เช่น wai-kru-2569" aria-invalid={!!errors.slug} {...register("slug")} />
              <p className="text-xs text-muted-foreground">ใช้ในลิงก์หน้าเว็บ /albums/&lt;slug&gt; — a-z, 0-9 และ -</p>
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">รายละเอียด (ไม่บังคับ)</Label>
              <Textarea id="description" rows={4} aria-invalid={!!errors.description} {...register("description")} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="eventDate">วันที่จัดกิจกรรม (ไม่บังคับ)</Label>
              <Input id="eventDate" type="date" aria-invalid={!!errors.eventDate} {...register("eventDate")} />
              {errors.eventDate && <p className="text-sm text-destructive">{errors.eventDate.message}</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">การเผยแพร่</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="status">สถานะ</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <select
                    id="status"
                    value={field.value}
                    onChange={field.onChange}
                    className="h-8 rounded-lg border border-border bg-background px-2 text-sm"
                  >
                    <option value="DRAFT">ร่าง (ยังไม่แสดงหน้าเว็บ)</option>
                    <option value="PUBLISHED">เผยแพร่</option>
                  </select>
                )}
              />
            </div>

            <div className="flex gap-2">
              <SubmitButton pending={isSubmitting} className="flex-1">
                {album ? "บันทึกการแก้ไข" : "สร้างอัลบั้ม"}
              </SubmitButton>
              <Button type="button" variant="outline" nativeButton={false} render={<Link href="/admin/albums" />}>
                ยกเลิก
              </Button>
            </div>

            {serverError && (
              <p className="text-sm text-destructive" role="alert">
                {serverError}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">รูปปก (ไม่บังคับ)</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              control={control}
              name="coverImage"
              render={({ field }) => (
                <ImageUpload value={field.value ?? ""} onChange={field.onChange} ariaInvalid={!!errors.coverImage} />
              )}
            />
            <p className="mt-2 text-xs text-muted-foreground">เว้นว่างได้ — หน้าเว็บจะใช้รูปแรกในอัลบั้มแทน</p>
            {errors.coverImage && <p className="mt-2 text-sm text-destructive">{errors.coverImage.message}</p>}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
