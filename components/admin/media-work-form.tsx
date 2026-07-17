"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ImageUpload } from "@/components/admin/image-upload";
import { SubmitButton } from "@/components/admin/submit-button";
import { MEDIA_TYPES, MEDIA_TYPE_LABEL, mediaWorkFormSchema, type MediaWorkFormValues } from "@/lib/validations/media-work";
import { createMediaWork, updateMediaWork } from "@/server/actions/media-work";

type Option = { id: string; name: string };

export function MediaWorkForm({
  tags,
  work,
}: {
  tags: Option[];
  work?: MediaWorkFormValues & { id: string };
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<MediaWorkFormValues>({
    resolver: standardSchemaResolver(mediaWorkFormSchema),
    defaultValues: work ?? {
      title: "",
      slug: "",
      description: "",
      type: "YOUTUBE",
      youtubeUrl: "",
      videoUrl: "",
      content: "",
      thumbnail: "",
      tagIds: [],
      featured: false,
      status: "DRAFT",
    },
  });

  // ชนิดที่เลือกอยู่ตอนนี้ — ใช้ตัดสินว่าจะโชว์ช่องไหน
  const type = useWatch({ control, name: "type" });

  async function onSubmit(values: MediaWorkFormValues) {
    setServerError(null);
    const result = work ? await updateMediaWork(work.id, values) : await createMediaWork(values);

    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) setError(field as keyof MediaWorkFormValues, { message: messages[0] });
        }
      }
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success(work ? "บันทึกการแก้ไขแล้ว" : "สร้างผลงานแล้ว");
    router.push("/admin/works");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3" noValidate>
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">ชื่อผลงาน / สื่อ</Label>
              <Input id="title" aria-invalid={!!errors.title} {...register("title")} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="slug">slug (ส่วนท้าย URL)</Label>
              <Input id="slug" placeholder="science-project-2569" aria-invalid={!!errors.slug} {...register("slug")} />
              <p className="text-xs text-muted-foreground">อังกฤษพิมพ์เล็ก ตัวเลข และ - เท่านั้น · จะได้ URL: /works/slug-ที่กรอก</p>
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">คำอธิบายสั้น (ไม่บังคับ)</Label>
              <Textarea id="description" rows={2} aria-invalid={!!errors.description} {...register("description")} />
              <p className="text-xs text-muted-foreground">ข้อความที่แสดงในการ์ดผลงานและผลค้นหา</p>
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">เนื้อหา</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="type">ชนิด</Label>
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <select
                    id="type"
                    value={field.value}
                    onChange={field.onChange}
                    className="h-8 w-fit rounded-lg border border-border bg-background px-2 text-sm"
                  >
                    {MEDIA_TYPES.map((value) => (
                      <option key={value} value={value}>
                        {MEDIA_TYPE_LABEL[value]}
                      </option>
                    ))}
                  </select>
                )}
              />
              <p className="text-xs text-muted-foreground">เลือกชนิดแล้วช่องกรอกด้านล่างจะเปลี่ยนตาม</p>
            </div>

            {/* ช่องกรอกเปลี่ยนตามชนิด — ค่าของชนิดอื่นยังอยู่ในฟอร์ม แต่จะถูกล้างตอนบันทึก */}
            {type === "YOUTUBE" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="youtubeUrl">ลิงก์ YouTube</Label>
                <Input
                  id="youtubeUrl"
                  placeholder="https://www.youtube.com/watch?v=…"
                  aria-invalid={!!errors.youtubeUrl}
                  {...register("youtubeUrl")}
                />
                <p className="text-xs text-muted-foreground">
                  วางลิงก์จาก address bar หรือปุ่ม Share ก็ได้ · ถ้าไม่อัปรูปปกเอง จะใช้รูปปกของคลิปให้อัตโนมัติ
                </p>
                {errors.youtubeUrl && <p className="text-sm text-destructive">{errors.youtubeUrl.message}</p>}
              </div>
            )}

            {type === "VIDEO" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="videoUrl">ลิงก์ไฟล์วิดีโอ</Label>
                <Input
                  id="videoUrl"
                  placeholder="https://res.cloudinary.com/…/video.mp4"
                  aria-invalid={!!errors.videoUrl}
                  {...register("videoUrl")}
                />
                <p className="text-xs text-muted-foreground">ลิงก์ไฟล์วิดีโอโดยตรง (เช่นที่อัปขึ้น Cloudinary)</p>
                {errors.videoUrl && <p className="text-sm text-destructive">{errors.videoUrl.message}</p>}
              </div>
            )}

            {type === "ARTICLE" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="content">เนื้อหาบทความ</Label>
                <Controller
                  control={control}
                  name="content"
                  render={({ field }) => (
                    <RichTextEditor
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      ariaInvalid={!!errors.content}
                    />
                  )}
                />
                {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
              </div>
            )}
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

            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="featured" className="font-normal">
                ปักหมุดเป็นผลงานเด่น
              </Label>
              <Controller
                control={control}
                name="featured"
                render={({ field }) => (
                  <Switch id="featured" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>

            <div className="flex gap-2">
              <SubmitButton pending={isSubmitting} className="flex-1">
                {work ? "บันทึกการแก้ไข" : "สร้างผลงาน"}
              </SubmitButton>
              <Button type="button" variant="outline" nativeButton={false} render={<Link href="/admin/works" />}>
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
            <CardTitle className="text-base">รูปปก</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              control={control}
              name="thumbnail"
              render={({ field }) => (
                <ImageUpload value={field.value ?? ""} onChange={field.onChange} ariaInvalid={!!errors.thumbnail} />
              )}
            />
            {type === "YOUTUBE" && (
              <p className="mt-2 text-xs text-muted-foreground">เว้นว่างได้ — จะดึงรูปปกจากคลิป YouTube ให้เอง</p>
            )}
            {errors.thumbnail && <p className="mt-2 text-sm text-destructive">{errors.thumbnail.message}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">แท็ก</CardTitle>
          </CardHeader>
          <CardContent>
            {tags.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                ยังไม่มีแท็ก — สร้างได้ที่หน้า “หมวดหมู่ &amp; แท็ก”
              </p>
            ) : (
              <Controller
                control={control}
                name="tagIds"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                      const selected = (field.value ?? []).includes(tag.id);
                      return (
                        <Button
                          key={tag.id}
                          type="button"
                          variant={selected ? "default" : "outline"}
                          size="xs"
                          onClick={() =>
                            field.onChange(
                              selected
                                ? (field.value ?? []).filter((id: string) => id !== tag.id)
                                : [...(field.value ?? []), tag.id],
                            )
                          }
                          aria-pressed={selected}
                        >
                          {tag.name}
                        </Button>
                      );
                    })}
                  </div>
                )}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
