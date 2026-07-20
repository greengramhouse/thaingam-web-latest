import { z } from "zod";
import { parseEventDateInput } from "@/lib/event";

/**
 * ฟอร์มประกาศด่วน — object แบน ๆ ตรงกับ <input>
 * วันที่เก็บเป็น **string** จาก <input type="datetime-local"> แล้วแปลงเป็น Date ตอนบันทึกใน action
 * (เหตุผลเดียวกับ event — RHF คุม string ง่ายกว่า, z.input ตรงกับ value ของ <input>)
 *
 * ⚠️ linkUrl/startsAt/endsAt ว่างได้ → `.or(z.literal(""))` กัน validation ตกตอนช่องว่าง
 */
export const announcementFormSchema = z
  .object({
    message: z
      .string()
      .min(1, "กรุณากรอกข้อความประกาศ")
      .max(300, "ข้อความยาวเกินไป (ไม่เกิน 300 ตัวอักษร)"),
    linkUrl: z.string().url("ลิงก์ปลายทางไม่ถูกต้อง").optional().or(z.literal("")),
    startsAt: z.string().optional().or(z.literal("")),
    endsAt: z.string().optional().or(z.literal("")),
    isActive: z.boolean().default(true),
  })
  .superRefine((data, ctx) => {
    const start = data.startsAt ? parseEventDateInput(data.startsAt, false) : null;
    if (data.startsAt && !start) {
      ctx.addIssue({ code: "custom", path: ["startsAt"], message: "เวลาเริ่มไม่ถูกต้อง" });
    }

    if (data.endsAt) {
      const end = parseEventDateInput(data.endsAt, false);
      if (!end) {
        ctx.addIssue({ code: "custom", path: ["endsAt"], message: "เวลาสิ้นสุดไม่ถูกต้อง" });
      } else if (start && end < start) {
        ctx.addIssue({ code: "custom", path: ["endsAt"], message: "เวลาสิ้นสุดต้องไม่ก่อนเวลาเริ่ม" });
      }
    }
  });

export type AnnouncementFormValues = z.input<typeof announcementFormSchema>;
