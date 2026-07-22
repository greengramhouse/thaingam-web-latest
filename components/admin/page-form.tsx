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
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { SubmitButton } from "@/components/admin/submit-button";
import { pageFormSchema, type PageFormValues } from "@/lib/validations/page";
import { createPage, updatePage } from "@/server/actions/page";

export function PageForm({ page }: { page?: PageFormValues & { id: string } }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<PageFormValues>({
    resolver: standardSchemaResolver(pageFormSchema),
    defaultValues: page ?? {
      title: "",
      slug: "",
      content: "",
      status: "PUBLISHED",
    },
  });

  async function onSubmit(values: PageFormValues) {
    setServerError(null);
    const result = page ? await updatePage(page.id, values) : await createPage(values);

    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) setError(field as keyof PageFormValues, { message: messages[0] });
        }
      }
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success(page ? "บันทึกการแก้ไขแล้ว" : "สร้างหน้าแล้ว");
    router.push("/admin/pages");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3" noValidate>
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">ชื่อหน้า</Label>
              <Input id="title" placeholder="เช่น ระเบียบการแต่งกาย" aria-invalid={!!errors.title} {...register("title")} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="slug">slug (ส่วนท้าย URL)</Label>
              <Input id="slug" placeholder="regulations" aria-invalid={!!errors.slug} {...register("slug")} />
              <p className="text-xs text-muted-foreground">อังกฤษพิมพ์เล็ก ตัวเลข และ - เท่านั้น · จะได้ URL: /slug-ที่กรอก</p>
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
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

            <div className="flex gap-2">
              <SubmitButton pending={isSubmitting} className="flex-1">
                {page ? "บันทึกการแก้ไข" : "สร้างหน้า"}
              </SubmitButton>
              <Button type="button" variant="outline" nativeButton={false} render={<Link href="/admin/pages" />}>
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
      </div>
    </form>
  );
}
