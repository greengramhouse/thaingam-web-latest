import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = {
  title: {
    default: "ระบบหลังบ้าน",
    template: "%s | ระบบหลังบ้าน",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // authorization จริงอยู่ที่นี่ — proxy.ts เช็คแค่ว่ามี cookie (optimistic) ไม่ได้เช็ค role
  // TEACHER ยังไม่มีสิทธิ์ในหลังบ้าน (ครูไม่โพสต์เนื้อหา — spec §3)
  // ส่วน "ข้อมูลภายในโรงเรียน" ของครูจะเป็น route group แยกภายหลัง
  const user = await requireRole("SUPER_ADMIN", "ADMIN");

  return (
    <AdminShell
      user={{
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role,
      }}
    >
      {children}
      <Toaster position="top-right" richColors />
    </AdminShell>
  );
}
