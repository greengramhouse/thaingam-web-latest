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
import { ImageUpload } from "@/components/admin/image-upload";
import { SubmitButton } from "@/components/admin/submit-button";
import { staffFormSchema, type StaffFormValues } from "@/lib/validations/staff";
import { createStaff, updateStaff } from "@/server/actions/staff";

export function StaffForm({
  staff,
  defaultOrder = "0",
}: {
  staff?: StaffFormValues & { id: string };
  /** ลำดับที่แนะนำสำหรับรายการใหม่ (max+1) — ให้ไม่ต้องคิดเลขเอง */
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
  } = useForm<StaffFormValues>({
    resolver: standardSchemaResolver(staffFormSchema),
    defaultValues: staff ?? {
      name: "",
      position: "",
      department: "",
      email: "",
      phone: "",
      bio: "",
      photo: "",
      order: defaultOrder,
      isActive: true,
    },
  });

  async function onSubmit(values: StaffFormValues) {
    setServerError(null);
    const result = staff ? await updateStaff(staff.id, values) : await createStaff(values);

    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) setError(field as keyof StaffFormValues, { message: messages[0] });
        }
      }
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success(staff ? "บันทึกการแก้ไขแล้ว" : "เพิ่มบุคลากรแล้ว");
    router.push("/admin/staff");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3" noValidate>
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">ชื่อ–สกุล</Label>
                <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="position">ตำแหน่ง</Label>
                <Input
                  id="position"
                  placeholder="เช่น ผู้อำนวยการ, ครูชำนาญการ"
                  aria-invalid={!!errors.position}
                  {...register("position")}
                />
                {errors.position && <p className="text-sm text-destructive">{errors.position.message}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="department">กลุ่มสาระ / ฝ่าย (ไม่บังคับ)</Label>
              <Input
                id="department"
                placeholder="เช่น กลุ่มสาระวิทยาศาสตร์, ฝ่ายบริหาร"
                aria-invalid={!!errors.department}
                {...register("department")}
              />
              {errors.department && <p className="text-sm text-destructive">{errors.department.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">อีเมล (ไม่บังคับ)</Label>
                <Input id="email" type="email" aria-invalid={!!errors.email} {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="phone">เบอร์โทร (ไม่บังคับ)</Label>
                <Input id="phone" aria-invalid={!!errors.phone} {...register("phone")} />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="bio">ประวัติ / รายละเอียด (ไม่บังคับ)</Label>
              <Textarea id="bio" rows={4} aria-invalid={!!errors.bio} {...register("bio")} />
              {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
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
                  แสดงบนหน้าเว็บ
                </Label>
                <p className="text-xs text-muted-foreground">ปิดไว้เพื่อเก็บข้อมูลโดยไม่แสดงในทำเนียบ</p>
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
              <Input
                id="order"
                type="number"
                min={0}
                inputMode="numeric"
                aria-invalid={!!errors.order}
                {...register("order")}
              />
              <p className="text-xs text-muted-foreground">เลขน้อยแสดงก่อน (0, 1, 2, …)</p>
              {errors.order && <p className="text-sm text-destructive">{errors.order.message}</p>}
            </div>

            <div className="flex gap-2">
              <SubmitButton pending={isSubmitting} className="flex-1">
                {staff ? "บันทึกการแก้ไข" : "เพิ่มบุคลากร"}
              </SubmitButton>
              <Button type="button" variant="outline" nativeButton={false} render={<Link href="/admin/staff" />}>
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
            <CardTitle className="text-base">รูปภาพ (ไม่บังคับ)</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              control={control}
              name="photo"
              render={({ field }) => (
                <ImageUpload value={field.value ?? ""} onChange={field.onChange} ariaInvalid={!!errors.photo} />
              )}
            />
            {errors.photo && <p className="mt-2 text-sm text-destructive">{errors.photo.message}</p>}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
