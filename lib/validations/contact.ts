import { z } from "zod";

/** ฟอร์มติดต่อสาธารณะ → สร้าง ContactMessage (ฝั่ง submit ของ Phase 4.4.12 ที่เลื่อนมา 4.6) */
export const contactFormSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ-นามสกุล").max(100, "ชื่อยาวเกินไป"),
  email: z.string().min(1, "กรุณากรอกอีเมล").email("อีเมลไม่ถูกต้อง").max(150, "อีเมลยาวเกินไป"),
  phone: z.string().max(30, "เบอร์โทรยาวเกินไป").optional().or(z.literal("")),
  subject: z.string().max(150, "หัวข้อยาวเกินไป").optional().or(z.literal("")),
  message: z.string().min(1, "กรุณากรอกข้อความ").max(2000, "ข้อความยาวเกินไป (ไม่เกิน 2000 ตัวอักษร)"),
});

export type ContactFormValues = z.input<typeof contactFormSchema>;
