import { format } from "date-fns";
import { th } from "date-fns/locale";

/**
 * วันที่ภาษาไทยแบบ **พ.ศ.** (ใช้ทั้งเว็บ — public + admin)
 *
 * date-fns token `yyyy`/`yy` ให้ปี **ค.ศ.** เสมอ (ไม่มีปฏิทินพุทธในตัว) →
 * เรา format เฉพาะวัน+เดือนด้วย date-fns แล้วต่อปี พ.ศ. (= ค.ศ. + 543) เอง
 * ห้ามใส่ `server-only` — validation/helper ฝั่ง client (event/announcement) import ไปด้วย
 */

/** ปีพุทธศักราช (พ.ศ. = ค.ศ. + 543) */
export function buddhistYear(date: Date): number {
  return date.getFullYear() + 543;
}

/**
 * long      → 15 กรกฎาคม 2568   (หน้ารายละเอียด)
 * medium    → 15 ก.ค. 2568       (การ์ด/ลิสต์ public)
 * short     → 15 ก.ค. 68         (ตารางหลังบ้าน — ปี 2 หลัก)
 * dayMonth  → 15 ก.ค.            (ไม่มีปี)
 */
export type ThaiDateStyle = "long" | "medium" | "short" | "dayMonth";

export function formatThaiDate(date: Date, style: ThaiDateStyle = "medium"): string {
  const be = buddhistYear(date);
  switch (style) {
    case "long":
      return `${format(date, "d MMMM", { locale: th })} ${be}`;
    case "short":
      return `${format(date, "d MMM", { locale: th })} ${be % 100}`;
    case "dayMonth":
      return format(date, "d MMM", { locale: th });
    case "medium":
    default:
      return `${format(date, "d MMM", { locale: th })} ${be}`;
  }
}

/** วันที่ + เวลา แบบ พ.ศ. → "15 ก.ค. 2568 09:00" (ผู้เรียกต่อ " น." เองถ้าต้องการ) */
export function formatThaiDateTime(date: Date, style: ThaiDateStyle = "medium"): string {
  return `${formatThaiDate(date, style)} ${format(date, "HH:mm")}`;
}
