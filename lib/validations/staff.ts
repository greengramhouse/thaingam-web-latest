import { z } from "zod";

/**
 * ฟอร์มบุคลากร — object แบน ๆ ตรงกับ <input>
 * ช่องที่ไม่บังคับใช้ `.or(z.literal(""))` กัน validation ตกตอนเว้นว่าง (แปลงเป็น null ตอนบันทึก)
 *
 * ⚠️ **ไม่มี `order` ในฟอร์มโดยตั้งใจ** — ลำดับจัดด้วยปุ่ม ▲▼ ที่หน้า /admin/staff
 * เดิมเคยเป็นช่องให้กรอกเลขเอง แต่ชนกับค่า max+1 ที่ระบบเติมให้ (คนใหม่ไปต่อท้ายเสมอ
 * แม้จะเป็น ผอ.) และมองไม่ออกว่าเลขนั้นแข่งกับใคร · action เป็นคนคิดเลขให้ทั้งหมด
 */
export const staffFormSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ").max(150, "ชื่อยาวเกินไป (ไม่เกิน 150 ตัวอักษร)"),
  position: z.string().min(1, "กรุณากรอกตำแหน่ง").max(150, "ตำแหน่งยาวเกินไป (ไม่เกิน 150 ตัวอักษร)"),
  department: z.string().max(150, "ชื่อกลุ่ม/ฝ่ายยาวเกินไป").optional().or(z.literal("")),
  email: z.string().email("อีเมลไม่ถูกต้อง").optional().or(z.literal("")),
  phone: z.string().max(30, "เบอร์โทรยาวเกินไป").optional().or(z.literal("")),
  bio: z.string().max(1000, "ประวัติยาวเกินไป (ไม่เกิน 1000 ตัวอักษร)").optional().or(z.literal("")),
  photo: z.string().url("ลิงก์รูปไม่ถูกต้อง").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export type StaffFormValues = z.input<typeof staffFormSchema>;
