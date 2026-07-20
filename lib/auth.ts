import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";
import { ac, roles } from "@/lib/permissions";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),

  emailAndPassword: {
    enabled: true,
    // ไม่มีสมัครสมาชิกเอง — SUPER_ADMIN เป็นผู้สร้าง user ทุกคน (spec §3)
    // ปิด POST /api/auth/sign-up/email ไม่ให้ใครสมัครเป็น TEACHER เองได้
    disableSignUp: true,
    // ⏭️ TODO (just-in-time): เปิด reset password เมื่อมี Resend
    //   ต้องมี RESEND_API_KEY + EMAIL_FROM แล้วใส่ sendResetPassword({ user, url }) ที่นี่
  },

  // ❌ ยกเลิก Google OAuth (ตัดสินใจ 2026-07-19 — เจ้าของไม่ต้องการแล้ว)
  //    เข้าระบบด้วย email/password อย่างเดียว · user ทุกคนสร้างโดย SUPER_ADMIN

  plugins: [
    // map role ให้ตรง enum Role ของโปรเจกต์ (ไม่ใช่ default "user"/"admin" ของ Better Auth)
    admin({
      ac,
      roles,
      defaultRole: "TEACHER",
      // ⚠️ เฉพาะ SUPER_ADMIN เท่านั้นที่เป็น "admin" ของ Better Auth (จัดการ user/session)
      //    เดิมมี ADMIN ด้วย → ADMIN ยิง /api/auth/admin/set-role ตั้งตัวเองเป็น SUPER_ADMIN ได้ (privilege escalation ยืนยันแล้ว)
      //    ADMIN จัดการ "เนื้อหา" ผ่าน canManageContent (ไม่พึ่ง admin plugin) จึงถอดออกได้ปลอดภัย · Users = SUPER_ADMIN only (spec §3)
      adminRoles: ["SUPER_ADMIN"],
    }),
    // nextCookies() ต้องเป็น plugin ตัวสุดท้ายเสมอ (จัดการ cookie ใน Server Actions)
    nextCookies(),
  ],
});
