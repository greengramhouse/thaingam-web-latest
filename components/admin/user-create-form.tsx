"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/admin/submit-button";
import { roleLabel } from "@/components/admin/role-label";
import { createUserSchema, USER_ROLES, type CreateUserValues } from "@/lib/validations/user";

export function UserCreateForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserValues>({
    resolver: standardSchemaResolver(createUserSchema),
    defaultValues: { name: "", email: "", password: "", role: "TEACHER" },
  });

  async function onSubmit(values: CreateUserValues) {
    setServerError(null);
    const { error } = await authClient.admin.createUser({
      name: values.name,
      email: values.email,
      password: values.password,
      role: values.role,
    });

    if (error) {
      // อีเมลซ้ำ → ขึ้นตรงช่อง · อื่น ๆ → แถบรวม
      const msg = error.message || "สร้างผู้ใช้ไม่สำเร็จ";
      if (error.code === "USER_ALREADY_EXISTS" || /exist/i.test(msg)) {
        setError("email", { message: "อีเมลนี้ถูกใช้แล้ว" });
      }
      setServerError(msg);
      toast.error(msg);
      return;
    }

    toast.success("สร้างผู้ใช้แล้ว");
    router.push("/admin/users");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl" noValidate>
      <Card>
        <CardContent className="flex flex-col gap-4 pt-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">ชื่อ-นามสกุล</Label>
            <Input id="name" aria-invalid={!!errors.name} {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="email">อีเมล (ใช้เข้าสู่ระบบ)</Label>
            <Input id="email" type="email" autoComplete="off" aria-invalid={!!errors.email} {...register("email")} />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password">รหัสผ่านตั้งต้น</Label>
            <Input id="password" type="text" autoComplete="new-password" aria-invalid={!!errors.password} {...register("password")} />
            <p className="text-xs text-muted-foreground">อย่างน้อย 8 ตัวอักษร · แจ้งผู้ใช้ให้เปลี่ยนภายหลัง</p>
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="role">บทบาท</Label>
            <select
              id="role"
              className="h-8 rounded-lg border border-border bg-background px-2 text-sm"
              aria-invalid={!!errors.role}
              {...register("role")}
            >
              {USER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {roleLabel(r)}
                </option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              ผู้ดูแลระบบ = จัดการเนื้อหา · ผู้ดูแลระบบสูงสุด = จัดการผู้ใช้และตั้งค่าได้ด้วย · ครู = ยังไม่มีสิทธิ์ในหลังบ้าน
            </p>
            {errors.role && <p className="text-sm text-destructive">{errors.role.message}</p>}
          </div>

          <div className="flex gap-2">
            <SubmitButton pending={isSubmitting} className="flex-1">
              สร้างผู้ใช้
            </SubmitButton>
            <Button type="button" variant="outline" nativeButton={false} render={<Link href="/admin/users" />}>
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
    </form>
  );
}
