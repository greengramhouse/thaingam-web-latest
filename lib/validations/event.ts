import { z } from "zod";
import { parseEventDateInput } from "@/lib/event";

/** สีตั้งต้นให้เลือกในปฏิทิน — ค่า hex เดียวกับที่ FullCalendar จะใช้ระบาย(Phase 4.6) */
export const EVENT_COLOR_PRESETS = [
  { value: "#ef4444", label: "แดง" },
  { value: "#f97316", label: "ส้ม" },
  { value: "#eab308", label: "เหลือง" },
  { value: "#22c55e", label: "เขียว" },
  { value: "#3b82f6", label: "น้ำเงิน" },
  { value: "#8b5cf6", label: "ม่วง" },
  { value: "#ec4899", label: "ชมพู" },
] as const;

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/**
 * ฟอร์มกิจกรรม — object แบน ๆ, วันที่เก็บเป็น **string** จาก <input date|datetime-local>
 * แล้วแปลงเป็น Date ตอนบันทึกใน server action (parseEventDateInput)
 * เหตุผลที่ไม่ให้ zod transform เป็น Date ตรงนี้: react-hook-form คุมค่า input ที่เป็น string
 * ง่ายกว่า และ type ของฟอร์ม (z.input) จะได้เป็น string ตรงกับ value ของ <input>
 *
 * ⚠️ endDate/color/coverImage ว่างได้ → ใช้ `.or(z.literal(""))` กัน validation ตกตอนช่องว่าง
 */
export const eventFormSchema = z
  .object({
    title: z.string().min(1, "กรุณากรอกชื่อกิจกรรม").max(200, "ชื่อยาวเกินไป (ไม่เกิน 200 ตัวอักษร)"),
    description: z.string().max(500, "รายละเอียดยาวเกินไป (ไม่เกิน 500 ตัวอักษร)").optional().or(z.literal("")),
    location: z.string().max(200, "สถานที่ยาวเกินไป (ไม่เกิน 200 ตัวอักษร)").optional().or(z.literal("")),
    allDay: z.boolean().default(false),
    startDate: z.string().min(1, "กรุณาเลือกวันเริ่ม"),
    endDate: z.string().optional().or(z.literal("")),
    color: z.string().regex(HEX_COLOR, "รหัสสีไม่ถูกต้อง (เช่น #3b82f6)").optional().or(z.literal("")),
    coverImage: z.string().url("ลิงก์รูปไม่ถูกต้อง").optional().or(z.literal("")),
    status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
  })
  .superRefine((data, ctx) => {
    const start = parseEventDateInput(data.startDate, data.allDay);
    if (!start) {
      ctx.addIssue({ code: "custom", path: ["startDate"], message: "วันเริ่มไม่ถูกต้อง" });
      return;
    }

    if (data.endDate) {
      const end = parseEventDateInput(data.endDate, data.allDay);
      if (!end) {
        ctx.addIssue({ code: "custom", path: ["endDate"], message: "วันสิ้นสุดไม่ถูกต้อง" });
      } else if (end < start) {
        ctx.addIssue({ code: "custom", path: ["endDate"], message: "วันสิ้นสุดต้องไม่ก่อนวันเริ่ม" });
      }
    }
  });

export type EventFormValues = z.input<typeof eventFormSchema>;
