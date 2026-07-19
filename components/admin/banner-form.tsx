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
import { ImageUpload } from "@/components/admin/image-upload";
import { SubmitButton } from "@/components/admin/submit-button";
import { bannerFormSchema, type BannerFormValues } from "@/lib/validations/banner";
import { createBanner, updateBanner } from "@/server/actions/banner";

export function BannerForm({
  banner,
  defaultOrder = "0",
}: {
  banner?: BannerFormValues & { id: string };
  /** ลำดับที่แนะนำสำหรับรายการใหม่ (max+1) */
  defaultOrder?: string;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<BannerFormValues>({
    resolver: standardSchemaResolver(bannerFormSchema),
    defaultValues: banner ?? {
      title: "",
      image: "",
      linkUrl: "",
      order: defaultOrder,
      isActive: true,
    },
  });

  async function onSubmit(values: BannerFormValues) {
    setServerError(null);
    const result = banner ? await updateBanner(banner.id, values) : await createBanner(values);

    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) setError(field as keyof BannerFormValues, { message: messages[0] });
        }
      }
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success(banner ? "บันทึกการแก้ไขแล้ว" : "เพิ่มแบนเนอร์แล้ว");
    router.push("/admin/banners");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3" noValidate>
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">รูปแบนเนอร์</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Controller
              control={control}
              name="image"
              render={({ field }) => (
                <ImageUpload value={field.value ?? ""} onChange={field.onChange} ariaInvalid={!!errors.image} />
              )}
            />
            <p className="text-xs text-muted-foreground">แนะนำภาพแนวนอนอัตราส่วนกว้าง (เช่น 16:6) สำหรับสไลด์หน้าแรก</p>
            {errors.image && <p className="text-sm text-destructive">{errors.image.message}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">ข้อความ &amp; ลิงก์ (ไม่บังคับ)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">ชื่อ / คำบรรยาย</Label>
              <Input
                id="title"
                placeholder="เช่น เปิดรับสมัครนักเรียนใหม่ 2568"
                aria-invalid={!!errors.title}
                {...register("title")}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="linkUrl">ลิงก์ปลายทางเมื่อคลิก</Label>
              <Input
                id="linkUrl"
                placeholder="https://… หรือ /news/…"
                aria-invalid={!!errors.linkUrl}
                {...register("linkUrl")}
              />
              <p className="text-xs text-muted-foreground">เว้นว่างได้ ถ้าเป็นภาพประชาสัมพันธ์ที่ไม่ต้องคลิกไปไหน</p>
              {errors.linkUrl && <p className="text-sm text-destructive">{errors.linkUrl.message}</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">การแสดงผล</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <Label htmlFor="isActive" className="font-normal">
                  แสดงบนหน้าแรก
                </Label>
                <p className="text-xs text-muted-foreground">ปิดไว้เพื่อเก็บโดยไม่แสดงในสไลด์</p>
              </div>
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <Switch id="isActive" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="order">ลำดับการแสดง</Label>
              <Input id="order" type="number" min={0} inputMode="numeric" aria-invalid={!!errors.order} {...register("order")} />
              <p className="text-xs text-muted-foreground">เลขน้อยแสดงก่อน (0, 1, 2, …)</p>
              {errors.order && <p className="text-sm text-destructive">{errors.order.message}</p>}
            </div>

            <div className="flex gap-2">
              <SubmitButton pending={isSubmitting} className="flex-1">
                {banner ? "บันทึกการแก้ไข" : "เพิ่มแบนเนอร์"}
              </SubmitButton>
              <Button type="button" variant="outline" nativeButton={false} render={<Link href="/admin/banners" />}>
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
