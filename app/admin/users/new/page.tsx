import type { Metadata } from "next";
import { PageHeader } from "@/components/admin/page-header";
import { UserCreateForm } from "@/components/admin/user-create-form";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "เพิ่มผู้ใช้" };

export default async function NewUserPage() {
  await requireRole("SUPER_ADMIN");

  return (
    <>
      <PageHeader title="เพิ่มผู้ใช้" description="สร้างบัญชีผู้ดูแลใหม่ แล้วแจ้งอีเมล/รหัสผ่านให้เจ้าตัว" />
      <UserCreateForm />
    </>
  );
}
