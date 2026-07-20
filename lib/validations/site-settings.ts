import { z } from "zod";
import { ALL_SETTINGS, fieldName } from "@/lib/site-settings";

/**
 * สร้าง schema จากนิยามใน lib/site-settings.ts — field ทุกช่องเป็น string (จาก <input>)
 * · ช่อง url: ถ้ากรอกต้องเป็น URL (เว้นว่างได้) · ที่เหลือจำกัดความยาวกันข้อมูลยาวเกิน
 * key ในฟอร์มใช้ `fieldName()` (dot → __) กัน react-hook-form ตีเป็น nested path
 */
const shape: Record<string, z.ZodTypeAny> = {};
for (const def of ALL_SETTINGS) {
  const name = fieldName(def.key);
  if (def.input === "url") {
    shape[name] = z.string().trim().url("ลิงก์ไม่ถูกต้อง (ต้องขึ้นต้น https://)").optional().or(z.literal(""));
  } else if (def.input === "textarea") {
    shape[name] = z.string().max(2000, "ข้อความยาวเกินไป").optional().or(z.literal(""));
  } else {
    shape[name] = z.string().max(300, "ข้อความยาวเกินไป").optional().or(z.literal(""));
  }
}

export const siteSettingsFormSchema = z.object(shape);

export type SiteSettingsFormValues = z.input<typeof siteSettingsFormSchema>;
