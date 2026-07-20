import { z } from "zod";
import { slugSchema } from "@/lib/validations/slug";

/**
 * ฟอร์มหน้าเนื้อหา — เรียบง่ายกว่า News (ไม่มี cover/category/tags/featured)
 * content เป็น rich text จาก Tiptap → เช็คว่าไม่ใช่แท็กเปล่า (เหมือน News)
 */
export const pageFormSchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่อหน้า").max(200, "ชื่อยาวเกินไป (ไม่เกิน 200 ตัวอักษร)"),
  slug: slugSchema,
  // Tiptap ส่ง "<p></p>" มาตอนว่าง — เช็คว่ามีตัวอักษรจริง ไม่ใช่แค่แท็กเปล่า
  content: z
    .string()
    .min(1, "กรุณากรอกเนื้อหา")
    .refine((html) => html.replace(/<[^>]*>/g, "").trim().length > 0, "กรุณากรอกเนื้อหา"),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
});

export type PageFormValues = z.input<typeof pageFormSchema>;
