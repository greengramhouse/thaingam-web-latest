import { z } from "zod";

/**
 * ฟอร์มบุคลากร — object แบน ๆ ตรงกับ <input>
 * ช่องที่ไม่บังคับใช้ `.or(z.literal(""))` กัน validation ตกตอนเว้นว่าง (แปลงเป็น null ตอนบันทึก)
 *
 * order เก็บเป็น **string** จาก <input type=number> (RHF คุมค่า string ง่ายกว่า number
 * ที่กลายเป็น NaN ตอนช่องว่าง) — เช็คว่าเป็นจำนวนเต็ม >= 0 ที่นี่ แล้ว coerce เป็นเลขตอนบันทึกใน action
 * เหตุผลเดียวกับวันที่ในฟอร์มกิจกรรม (ดู lib/validations/event.ts)
 */
export const staffFormSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อ").max(150, "ชื่อยาวเกินไป (ไม่เกิน 150 ตัวอักษร)"),
  position: z.string().min(1, "กรุณากรอกตำแหน่ง").max(150, "ตำแหน่งยาวเกินไป (ไม่เกิน 150 ตัวอักษร)"),
  department: z.string().max(150, "ชื่อกลุ่ม/ฝ่ายยาวเกินไป").optional().or(z.literal("")),
  email: z.string().email("อีเมลไม่ถูกต้อง").optional().or(z.literal("")),
  phone: z.string().max(30, "เบอร์โทรยาวเกินไป").optional().or(z.literal("")),
  bio: z.string().max(1000, "ประวัติยาวเกินไป (ไม่เกิน 1000 ตัวอักษร)").optional().or(z.literal("")),
  photo: z.string().url("ลิงก์รูปไม่ถูกต้อง").optional().or(z.literal("")),
  order: z
    .string()
    .min(1, "กรุณากรอกลำดับ")
    .regex(/^\d+$/, "ลำดับต้องเป็นจำนวนเต็มไม่ติดลบ")
    .refine((v) => Number(v) <= 9999, "ลำดับมากเกินไป"),
  isActive: z.boolean().default(true),
});

export type StaffFormValues = z.input<typeof staffFormSchema>;
