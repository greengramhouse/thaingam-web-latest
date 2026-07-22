"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { CheckCircle2, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/admin/submit-button";
import { contactFormSchema, type ContactFormValues } from "@/lib/validations/contact";
import { submitContactMessage } from "@/server/actions/contact-message";

export function ContactForm() {
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: standardSchemaResolver(contactFormSchema),
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" },
  });

  async function onSubmit(values: ContactFormValues) {
    setServerError(null);
    const result = await submitContactMessage(values);
    if (result.ok) {
      setDone(true);
      return;
    }
    if (result.fieldErrors) {
      for (const [field, msgs] of Object.entries(result.fieldErrors)) {
        if (msgs?.[0]) setError(field as keyof ContactFormValues, { message: msgs[0] });
      }
    }
    setServerError(result.error ?? "ส่งข้อความไม่สำเร็จ");
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-16 text-center shadow-sm">
        <CheckCircle2 className="size-12 text-mint-foreground" aria-hidden="true" />
        <h2 className="text-xl font-semibold">ส่งข้อความเรียบร้อยแล้ว</h2>
        <p className="max-w-sm text-sm text-muted-foreground">
          ขอบคุณที่ติดต่อเรา ทางโรงเรียนได้รับข้อความของคุณแล้ว และจะติดต่อกลับโดยเร็วที่สุด
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-7"
      noValidate
    >
      <h2 className="text-xl font-semibold">ส่งข้อความถึงเรา</h2>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">กรอกแบบฟอร์มด้านล่าง เราจะติดต่อกลับโดยเร็วที่สุด</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="cf-name">ชื่อ-นามสกุล</Label>
          <Input id="cf-name" {...register("name")} placeholder="ชื่อของคุณ" aria-invalid={!!errors.name} className="mt-1.5" />
          {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="cf-phone">เบอร์โทรศัพท์</Label>
          <Input id="cf-phone" {...register("phone")} placeholder="08X-XXX-XXXX" aria-invalid={!!errors.phone} className="mt-1.5" />
          {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="mt-4">
        <Label htmlFor="cf-email">อีเมล</Label>
        <Input id="cf-email" type="email" {...register("email")} placeholder="you@email.com" aria-invalid={!!errors.email} className="mt-1.5" />
        {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="mt-4">
        <Label htmlFor="cf-subject">หัวข้อ</Label>
        <Input id="cf-subject" {...register("subject")} placeholder="เรื่องที่ต้องการติดต่อ" aria-invalid={!!errors.subject} className="mt-1.5" />
        {errors.subject && <p className="mt-1 text-xs text-destructive">{errors.subject.message}</p>}
      </div>

      <div className="mt-4">
        <Label htmlFor="cf-message">ข้อความ</Label>
        <Textarea id="cf-message" {...register("message")} rows={4} placeholder="รายละเอียด…" aria-invalid={!!errors.message} className="mt-1.5" />
        {errors.message && <p className="mt-1 text-xs text-destructive">{errors.message.message}</p>}
      </div>

      {serverError && <p className="mt-4 text-sm text-destructive">{serverError}</p>}

      <SubmitButton pending={isSubmitting} pendingLabel="กำลังส่ง…" className="mt-6 w-full">
        ส่งข้อความ
        <Send className="size-4" aria-hidden="true" />
      </SubmitButton>
    </form>
  );
}
