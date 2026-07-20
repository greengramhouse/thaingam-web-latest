import { z } from "zod";

/** บทบาทที่ SUPER_ADMIN กำหนดให้ผู้ใช้ได้ */
export const USER_ROLES = ["SUPER_ADMIN", "ADMIN", "TEACHER"] as const;

/** รหัสผ่านขั้นต่ำ 8 ตัว (ตรงกับค่าเริ่มต้นของ Better Auth) */
const passwordSchema = z.string().min(8, "รหัสผ่านอย่างน้อย 8 ตัวอักษร").max(128, "รหัสผ่านยาวเกินไป");

export const createUserSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ").max(100, "ชื่อยาวเกินไป"),
  email: z.string().min(1, "กรุณากรอกอีเมล").email("อีเมลไม่ถูกต้อง"),
  password: passwordSchema,
  role: z.enum(USER_ROLES),
});

export type CreateUserValues = z.input<typeof createUserSchema>;

export const resetPasswordSchema = z.object({
  newPassword: passwordSchema,
});

export type ResetPasswordValues = z.input<typeof resetPasswordSchema>;
