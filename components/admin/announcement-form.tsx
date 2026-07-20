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
import { SubmitButton } from "@/components/admin/submit-button";
import { announcementFormSchema, type AnnouncementFormValues } from "@/lib/validations/announcement";
import { createAnnouncement, updateAnnouncement } from "@/server/actions/announcement";

export function AnnouncementForm({
  announcement,
}: {
  announcement?: AnnouncementFormValues & { id: string };
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AnnouncementFormValues>({
    resolver: standardSchemaResolver(announcementFormSchema),
    defaultValues: announcement ?? {
      message: "",
      linkUrl: "",
      startsAt: "",
      endsAt: "",
      isActive: true,
    },
  });

  async function onSubmit(values: AnnouncementFormValues) {
    setServerError(null);
    const result = announcement
      ? await updateAnnouncement(announcement.id, values)
      : await createAnnouncement(values);

    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) setError(field as keyof AnnouncementFormValues, { message: messages[0] });
        }
      }
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success(announcement ? "บันทึกการแก้ไขแล้ว" : "เพิ่มประกาศแล้ว");
    router.push("/admin/announcements");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3" noValidate>
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">ข้อความประกาศ</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="message">ข้อความ</Label>
              <Textarea
                id="message"
                rows={3}
                placeholder="เช่น ประกาศหยุดเรียนวันที่ 15 ส.ค. เนื่องในวันแม่แห่งชาติ"
                aria-invalid={!!errors.message}
                {...register("message")}
              />
              <p className="text-xs text-muted-foreground">แสดงเป็นแถบเดียวบนสุดของหน้าแรก — เขียนสั้น กระชับ</p>
              {errors.message && <p className="text-sm text-destructive">{errors.message.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="linkUrl">ลิงก์ปลายทางเมื่อคลิก (ไม่บังคับ)</Label>
              <Input
                id="linkUrl"
                placeholder="https://… หรือ /news/…"
                aria-invalid={!!errors.linkUrl}
                {...register("linkUrl")}
              />
              <p className="text-xs text-muted-foreground">เว้นว่างได้ ถ้าเป็นประกาศที่ไม่ต้องคลิกไปไหน</p>
              {errors.linkUrl && <p className="text-sm text-destructive">{errors.linkUrl.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">ช่วงเวลาแสดง (ไม่บังคับ)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="startsAt">เริ่มแสดง</Label>
              <Input
                id="startsAt"
                type="datetime-local"
                aria-invalid={!!errors.startsAt}
                {...register("startsAt")}
              />
              <p className="text-xs text-muted-foreground">เว้นว่าง = แสดงทันที</p>
              {errors.startsAt && <p className="text-sm text-destructive">{errors.startsAt.message}</p>}
            </div>

            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="endsAt">หยุดแสดง</Label>
              <Input
                id="endsAt"
                type="datetime-local"
                aria-invalid={!!errors.endsAt}
                {...register("endsAt")}
              />
              <p className="text-xs text-muted-foreground">เว้นว่าง = ไม่มีกำหนดหมดอายุ</p>
              {errors.endsAt && <p className="text-sm text-destructive">{errors.endsAt.message}</p>}
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
                  เปิดใช้งาน
                </Label>
                <p className="text-xs text-muted-foreground">ปิดไว้เพื่อเก็บโดยไม่แสดงบนหน้าแรก</p>
              </div>
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <Switch id="isActive" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>

            <div className="flex gap-2">
              <SubmitButton pending={isSubmitting} className="flex-1">
                {announcement ? "บันทึกการแก้ไข" : "เพิ่มประกาศ"}
              </SubmitButton>
              <Button type="button" variant="outline" nativeButton={false} render={<Link href="/admin/announcements" />}>
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
