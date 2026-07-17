import { z } from "zod";
import { slugSchema } from "@/lib/validations/slug";

export const categoryFormSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อหมวดหมู่").max(60, "ชื่อยาวเกินไป (ไม่เกิน 60 ตัวอักษร)"),
  slug: slugSchema,
  description: z.string().max(200, "คำอธิบายยาวเกินไป (ไม่เกิน 200 ตัวอักษร)").optional().or(z.literal("")),
});

export const tagFormSchema = z.object({
  name: z.string().min(1, "กรุณากรอกชื่อแท็ก").max(40, "ชื่อยาวเกินไป (ไม่เกิน 40 ตัวอักษร)"),
  slug: slugSchema,
});

export type CategoryFormValues = z.input<typeof categoryFormSchema>;
export type TagFormValues = z.input<typeof tagFormSchema>;
