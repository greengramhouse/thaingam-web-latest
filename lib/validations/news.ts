import { z } from "zod";
import { slugSchema } from "@/lib/validations/slug";

export const newsFormSchema = z.object({
  title: z.string().min(1, "กรุณากรอกหัวข้อข่าว").max(200, "หัวข้อยาวเกินไป (ไม่เกิน 200 ตัวอักษร)"),
  slug: slugSchema,
  excerpt: z.string().max(300, "เกริ่นนำยาวเกินไป (ไม่เกิน 300 ตัวอักษร)").optional().or(z.literal("")),
  // Tiptap ส่ง "<p></p>" มาตอนว่าง — เช็คว่ามีตัวอักษรจริง ไม่ใช่แค่แท็กเปล่า
  content: z
    .string()
    .min(1, "กรุณากรอกเนื้อหา")
    .refine((html) => html.replace(/<[^>]*>/g, "").trim().length > 0, "กรุณากรอกเนื้อหา"),
  coverImage: z.string().url("ลิงก์รูปไม่ถูกต้อง").optional().or(z.literal("")),
  categoryId: z.string().optional().or(z.literal("")),
  tagIds: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
});

export type NewsFormValues = z.input<typeof newsFormSchema>;
export type NewsFormParsed = z.output<typeof newsFormSchema>;
