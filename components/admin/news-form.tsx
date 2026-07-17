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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ImageUpload } from "@/components/admin/image-upload";
import { SubmitButton } from "@/components/admin/submit-button";
import { newsFormSchema, type NewsFormValues } from "@/lib/validations/news";
import { createNews, updateNews } from "@/server/actions/news";

type Option = { id: string; name: string };

export function NewsForm({
  categories,
  tags,
  news,
}: {
  categories: Option[];
  tags: Option[];
  news?: NewsFormValues & { id: string };
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<NewsFormValues>({
    resolver: standardSchemaResolver(newsFormSchema),
    defaultValues: news ?? {
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      coverImage: "",
      categoryId: "",
      tagIds: [],
      featured: false,
      status: "DRAFT",
    },
  });

  async function onSubmit(values: NewsFormValues) {
    setServerError(null);
    const result = news ? await updateNews(news.id, values) : await createNews(values);

    if (!result.ok) {
      // map error รายฟิลด์จาก server กลับเข้าฟอร์ม (เช่น slug ซ้ำ) ให้ขึ้นตรงช่องนั้น
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) setError(field as keyof NewsFormValues, { message: messages[0] });
        }
      }
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success(news ? "บันทึกการแก้ไขแล้ว" : "สร้างข่าวแล้ว");
    router.push("/admin/news");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3" noValidate>
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">หัวข้อข่าว</Label>
              <Input id="title" aria-invalid={!!errors.title} {...register("title")} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="slug">slug (ส่วนท้าย URL)</Label>
              <Input id="slug" placeholder="wai-kru-2569" aria-invalid={!!errors.slug} {...register("slug")} />
              <p className="text-xs text-muted-foreground">อังกฤษพิมพ์เล็ก ตัวเลข และ - เท่านั้น · จะได้ URL: /news/slug-ที่กรอก</p>
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="excerpt">เกริ่นนำ (ไม่บังคับ)</Label>
              <Textarea id="excerpt" rows={2} aria-invalid={!!errors.excerpt} {...register("excerpt")} />
              <p className="text-xs text-muted-foreground">ข้อความสั้น ๆ ที่แสดงในการ์ดข่าวและผลค้นหา</p>
              {errors.excerpt && <p className="text-sm text-destructive">{errors.excerpt.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="content">เนื้อหา</Label>
              <Controller
                control={control}
                name="content"
                render={({ field }) => (
                  <RichTextEditor value={field.value} onChange={field.onChange} ariaInvalid={!!errors.content} />
                )}
              />
              {errors.content && <p className="text-sm text-destructive">{errors.content.message}</p>}
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

            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="featured" className="font-normal">
                ปักหมุดเป็นข่าวเด่น
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
                {news ? "บันทึกการแก้ไข" : "สร้างข่าว"}
              </SubmitButton>
              <Button type="button" variant="outline" nativeButton={false} render={<Link href="/admin/news" />}>
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
              name="coverImage"
              render={({ field }) => (
                <ImageUpload
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  ariaInvalid={!!errors.coverImage}
                />
              )}
            />
            {errors.coverImage && <p className="mt-2 text-sm text-destructive">{errors.coverImage.message}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">หมวดหมู่ & แท็ก</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="categoryId">หมวดหมู่</Label>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <select
                    id="categoryId"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    className="h-8 rounded-lg border border-border bg-background px-2 text-sm"
                  >
                    <option value="">— ไม่ระบุ —</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">แท็ก</span>
              {tags.length === 0 ? (
                <p className="text-xs text-muted-foreground">ยังไม่มีแท็ก — สร้างได้ที่หน้าหมวดหมู่ &amp; แท็ก (Phase 4.4.2)</p>
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
            </div>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
