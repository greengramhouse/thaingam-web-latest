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
import { FileUpload } from "@/components/admin/file-upload";
import { SubmitButton } from "@/components/admin/submit-button";
import { documentFormSchema, type DocumentFormValues } from "@/lib/validations/document";
import { createDocument, updateDocument } from "@/server/actions/document";

/** หมวดยอดนิยม — เป็นแค่คำแนะนำใน datalist ไม่ได้บังคับ (category เป็น free text) */
const CATEGORY_SUGGESTIONS = ["ประกาศ", "แบบฟอร์ม", "หลักสูตร", "ระเบียบ", "เอกสารเผยแพร่"];

export function DocumentForm({ document }: { document?: DocumentFormValues & { id: string } }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DocumentFormValues>({
    resolver: standardSchemaResolver(documentFormSchema),
    defaultValues: document ?? {
      title: "",
      description: "",
      fileUrl: "",
      fileType: "",
      category: "",
      published: true,
    },
  });

  async function onSubmit(values: DocumentFormValues) {
    setServerError(null);
    const result = document ? await updateDocument(document.id, values) : await createDocument(values);

    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) setError(field as keyof DocumentFormValues, { message: messages[0] });
        }
      }
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success(document ? "บันทึกการแก้ไขแล้ว" : "เพิ่มเอกสารแล้ว");
    router.push("/admin/documents");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3" noValidate>
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ข้อมูลเอกสาร</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">ชื่อเอกสาร</Label>
              <Input id="title" aria-invalid={!!errors.title} {...register("title")} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">รายละเอียด (ไม่บังคับ)</Label>
              <Textarea id="description" rows={3} aria-invalid={!!errors.description} {...register("description")} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="category">หมวด (ไม่บังคับ)</Label>
                <Input
                  id="category"
                  list="document-category-suggestions"
                  placeholder="เช่น ประกาศ, แบบฟอร์ม"
                  aria-invalid={!!errors.category}
                  {...register("category")}
                />
                <datalist id="document-category-suggestions">
                  {CATEGORY_SUGGESTIONS.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
                {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="fileType">ชนิดไฟล์ (ไม่บังคับ)</Label>
                <Input
                  id="fileType"
                  placeholder="เช่น PDF, DOCX"
                  aria-invalid={!!errors.fileType}
                  {...register("fileType")}
                />
                <p className="text-xs text-muted-foreground">เว้นว่างให้ระบบเดาจากนามสกุลไฟล์</p>
                {errors.fileType && <p className="text-sm text-destructive">{errors.fileType.message}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">ไฟล์เอกสาร</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              control={control}
              name="fileUrl"
              render={({ field }) => (
                <FileUpload value={field.value ?? ""} onChange={field.onChange} ariaInvalid={!!errors.fileUrl} />
              )}
            />
            {errors.fileUrl && <p className="mt-2 text-sm text-destructive">{errors.fileUrl.message}</p>}
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">การเผยแพร่</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <Label htmlFor="published" className="font-normal">
                  เผยแพร่บนหน้าเว็บ
                </Label>
                <p className="text-xs text-muted-foreground">ปิดไว้เพื่อเก็บเป็นร่างก่อนเผยแพร่</p>
              </div>
              <Controller
                control={control}
                name="published"
                render={({ field }) => (
                  <Switch id="published" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>

            <div className="flex gap-2">
              <SubmitButton pending={isSubmitting} className="flex-1">
                {document ? "บันทึกการแก้ไข" : "เพิ่มเอกสาร"}
              </SubmitButton>
              <Button
                type="button"
                variant="outline"
                nativeButton={false}
                render={<Link href="/admin/documents" />}
              >
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
