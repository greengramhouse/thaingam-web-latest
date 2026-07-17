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

  // ⏭️ TODO (just-in-time): เพิ่ม Google OAuth เมื่อมี GOOGLE_CLIENT_ID/SECRET
  // socialProviders: {
  //   google: {
  //     clientId: process.env.GOOGLE_CLIENT_ID!,
  //     clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  //   },
  // },

  plugins: [
    // map role ให้ตรง enum Role ของโปรเจกต์ (ไม่ใช่ default "user"/"admin" ของ Better Auth)
    admin({
      ac,
      roles,
      defaultRole: "TEACHER",
      adminRoles: ["SUPER_ADMIN", "ADMIN"],
    }),
    // nextCookies() ต้องเป็น plugin ตัวสุดท้ายเสมอ (จัดการ cookie ใน Server Actions)
    nextCookies(),
  ],
});
