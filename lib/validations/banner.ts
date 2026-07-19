import { z } from "zod";

/**
 * ฟอร์มแบนเนอร์ Hero — object แบน ๆ ตรงกับ <input>
 * `order` เก็บเป็น string จาก <input number> แล้ว coerce เป็นเลขตอนบันทึก (เหมือน staff)
 * image บังคับ · title/linkUrl ไม่บังคับ (`.or(z.literal(""))` กัน validation ตกตอนเว้นว่าง)
 */
export const bannerFormSchema = z.object({
  title: z.string().max(150, "ชื่อยาวเกินไป (ไม่เกิน 150 ตัวอักษร)").optional().or(z.literal("")),
  image: z.string().min(1, "กรุณาแนบรูปหรือวางลิงก์รูป").url("ลิงก์รูปไม่ถูกต้อง"),
  linkUrl: z.string().url("ลิงก์ปลายทางไม่ถูกต้อง").optional().or(z.literal("")),
  order: z
    .string()
    .min(1, "กรุณากรอกลำดับ")
    .regex(/^\d+$/, "ลำดับต้องเป็นจำนวนเต็มไม่ติดลบ")
    .refine((v) => Number(v) <= 9999, "ลำดับมากเกินไป"),
  isActive: z.boolean().default(true),
});

export type BannerFormValues = z.input<typeof bannerFormSchema>;
