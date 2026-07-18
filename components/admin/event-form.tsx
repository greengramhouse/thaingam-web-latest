"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Controller, useForm, useWatch } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/admin/image-upload";
import { SubmitButton } from "@/components/admin/submit-button";
import { EVENT_COLOR_PRESETS, eventFormSchema, type EventFormValues } from "@/lib/validations/event";
import { createEvent, updateEvent } from "@/server/actions/event";

export function EventForm({ event }: { event?: EventFormValues & { id: string } }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setError,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: standardSchemaResolver(eventFormSchema),
    defaultValues: event ?? {
      title: "",
      description: "",
      location: "",
      allDay: false,
      startDate: "",
      endDate: "",
      color: "",
      coverImage: "",
      status: "PUBLISHED",
    },
  });

  const allDay = useWatch({ control, name: "allDay" });

  /**
   * สลับ allDay แล้วต้อง normalize ค่าวันที่ที่กรอกไว้ ไม่งั้น browser โชว์ช่องว่าง
   * เพราะรูปแบบไม่ตรงกับ type ใหม่ ("2026-07-20T09:00" ใส่ใน <input type=date> = invalid)
   *  - เปิด allDay: ตัดเวลาทิ้ง เหลือ "yyyy-MM-dd"
   *  - ปิด allDay: เติมเวลา 00:00 เป็น "yyyy-MM-ddTHH:mm"
   */
  function handleAllDayChange(next: boolean) {
    setValue("allDay", next);
    for (const field of ["startDate", "endDate"] as const) {
      const current = getValues(field);
      if (!current) continue;
      const datePart = current.slice(0, 10);
      setValue(field, next ? datePart : `${datePart}T00:00`);
    }
  }

  async function onSubmit(values: EventFormValues) {
    setServerError(null);
    const result = event ? await updateEvent(event.id, values) : await createEvent(values);

    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) setError(field as keyof EventFormValues, { message: messages[0] });
        }
      }
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success(event ? "บันทึกการแก้ไขแล้ว" : "สร้างกิจกรรมแล้ว");
    router.push("/admin/events");
    router.refresh();
  }

  const dateInputType = allDay ? "date" : "datetime-local";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-3" noValidate>
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardContent className="flex flex-col gap-4 pt-6">
            <div className="flex flex-col gap-2">
              <Label htmlFor="title">ชื่อกิจกรรม</Label>
              <Input id="title" aria-invalid={!!errors.title} {...register("title")} />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="location">สถานที่ (ไม่บังคับ)</Label>
              <Input id="location" placeholder="เช่น หอประชุมโรงเรียน" aria-invalid={!!errors.location} {...register("location")} />
              {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">รายละเอียด (ไม่บังคับ)</Label>
              <Textarea id="description" rows={4} aria-invalid={!!errors.description} {...register("description")} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">วันและเวลา</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex flex-col">
                <Label htmlFor="allDay" className="font-normal">
                  ทั้งวัน (ไม่ระบุเวลา)
                </Label>
                <p className="text-xs text-muted-foreground">เปิดไว้สำหรับกิจกรรมที่นับเป็นวัน เช่น วันหยุด สอบ</p>
              </div>
              <Controller
                control={control}
                name="allDay"
                render={({ field }) => (
                  <Switch
                    id="allDay"
                    checked={field.value}
                    onCheckedChange={(checked) => handleAllDayChange(checked)}
                  />
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="startDate">วัน{allDay ? "" : "และเวลา"}เริ่ม</Label>
                {/*
                  key ผูกกับ allDay → พอ toggle ให้ input remount เป็น element ใหม่พร้อม type + ค่าที่ถูกต้อง
                  (handleAllDayChange normalize ค่าใน RHF ไว้ก่อนแล้ว → defaultValue หยิบค่านั้นมา)
                  ถ้าไม่ remount: เปลี่ยน type บน element เดิม เบราว์เซอร์ล้างค่าที่ไม่ตรง type แล้วยิง onChange("") ทับ → วันหาย
                */}
                <Input
                  id="startDate"
                  key={allDay ? "start-date" : "start-datetime"}
                  type={dateInputType}
                  defaultValue={getValues("startDate")}
                  aria-invalid={!!errors.startDate}
                  {...register("startDate")}
                />
                {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="endDate">วัน{allDay ? "" : "และเวลา"}สิ้นสุด (ไม่บังคับ)</Label>
                <Input
                  id="endDate"
                  key={allDay ? "end-date" : "end-datetime"}
                  type={dateInputType}
                  defaultValue={getValues("endDate")}
                  aria-invalid={!!errors.endDate}
                  {...register("endDate")}
                />
                <p className="text-xs text-muted-foreground">เว้นว่าง = กิจกรรมวันเดียว</p>
                {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
              </div>
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
                {event ? "บันทึกการแก้ไข" : "สร้างกิจกรรม"}
              </SubmitButton>
              <Button type="button" variant="outline" nativeButton={false} render={<Link href="/admin/events" />}>
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
            <CardTitle className="text-base">สีในปฏิทิน</CardTitle>
          </CardHeader>
          <CardContent>
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {EVENT_COLOR_PRESETS.map((preset) => {
                      const selected = field.value === preset.value;
                      return (
                        <button
                          key={preset.value}
                          type="button"
                          onClick={() => field.onChange(preset.value)}
                          aria-label={preset.label}
                          aria-pressed={selected}
                          title={preset.label}
                          className="flex size-7 items-center justify-center rounded-full border border-border ring-offset-2 ring-offset-background transition data-[selected=true]:ring-2 data-[selected=true]:ring-ring"
                          data-selected={selected}
                          style={{ backgroundColor: preset.value }}
                        >
                          {selected && <Check className="size-4 text-white" aria-hidden="true" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      aria-label="เลือกสีเอง"
                      value={/^#[0-9a-fA-F]{6}$/.test(field.value ?? "") ? field.value : "#3b82f6"}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="h-8 w-10 cursor-pointer rounded border border-border bg-background p-0.5"
                    />
                    <span className="text-xs text-muted-foreground">
                      {field.value ? field.value : "ยังไม่ระบุสี"}
                    </span>
                    {field.value && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => field.onChange("")}
                        className="ml-auto"
                      >
                        <X className="size-3.5" aria-hidden="true" />
                        ล้างสี
                      </Button>
                    )}
                  </div>
                  {errors.color && <p className="text-sm text-destructive">{errors.color.message}</p>}
                </div>
              )}
            />
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
            {errors.coverImage && <p className="mt-2 text-sm text-destructive">{errors.coverImage.message}</p>}
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
