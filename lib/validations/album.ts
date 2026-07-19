import { z } from "zod";
import { slugSchema } from "@/lib/validations/slug";

/**
 * ฟอร์มอัลบั้ม — object แบน ๆ ตรงกับ <input>
 * eventDate เก็บเป็น **string** "yyyy-MM-dd" จาก <input type=date> แล้วแปลงเป็น Date ตอนบันทึก
 * (ใช้ parseEventDateInput(_, true) เหมือน event allDay — วันไม่เพี้ยนข้าม timezone)
 *
 * รูปในอัลบั้มไม่ได้อยู่ในฟอร์มนี้ — จัดการแยกใน album-photos-manager หลังบันทึกอัลบั้มแล้ว
 * (Photo ต้องมี albumId ก่อนถึงผูกได้ → สร้างอัลบั้มก่อน ค่อยเพิ่มรูปในหน้าแก้ไข)
 */
export const albumFormSchema = z.object({
  title: z.string().min(1, "กรุณากรอกชื่ออัลบั้ม").max(200, "ชื่อยาวเกินไป (ไม่เกิน 200 ตัวอักษร)"),
  slug: slugSchema,
  description: z.string().max(1000, "รายละเอียดยาวเกินไป").optional().or(z.literal("")),
  coverImage: z.string().url("ลิงก์รูปไม่ถูกต้อง").optional().or(z.literal("")),
  eventDate: z.string().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
});

export type AlbumFormValues = z.input<typeof albumFormSchema>;

/** caption ของรูป — แก้ inline ในตัวจัดการรูป (ว่างได้) */
export const photoCaptionSchema = z.string().max(300, "คำบรรยายยาวเกินไป (ไม่เกิน 300 ตัวอักษร)");
