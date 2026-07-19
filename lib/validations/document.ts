import { z } from "zod";

/**
 * ฟอร์มเอกสารดาวน์โหลด — object แบน ๆ ตรงกับ <input>
 * ช่องไม่บังคับใช้ `.or(z.literal(""))` กัน validation ตกตอนเว้นว่าง (แปลงเป็น null ตอนบันทึกใน action)
 *
 * `published` เป็น boolean ในฟอร์ม (Switch) แล้ว map เป็น `status` PUBLISHED/DRAFT ตอนบันทึก
 * (เหมือน isActive ของ staff — RHF คุม boolean ตรงไปตรงมากว่า enum)
 */
export const documentFormSchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่อเอกสาร").max(200, "ชื่อยาวเกินไป (ไม่เกิน 200 ตัวอักษร)"),
  description: z.string().max(1000, "รายละเอียดยาวเกินไป (ไม่เกิน 1000 ตัวอักษร)").optional().or(z.literal("")),
  fileUrl: z
    .string()
    .min(1, "กรุณาแนบไฟล์หรือวางลิงก์ไฟล์")
    .url("ลิงก์ไฟล์ไม่ถูกต้อง"),
  fileType: z.string().max(20, "ชนิดไฟล์ยาวเกินไป").optional().or(z.literal("")),
  category: z.string().max(100, "ชื่อหมวดยาวเกินไป").optional().or(z.literal("")),
  published: z.boolean().default(true),
});

export type DocumentFormValues = z.input<typeof documentFormSchema>;
