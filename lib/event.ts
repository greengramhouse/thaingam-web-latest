import { format } from "date-fns";
import { th } from "date-fns/locale";

/**
 * Date helpers ของกิจกรรม — pure ใช้ได้ทั้ง client (ฟอร์ม/validation) และ server (action)
 * **ห้ามใส่ `server-only`** เพราะ lib/validations/event.ts (รันฝั่ง client ด้วย) import ไป
 *
 * ⚠️ กับดัก timezone ที่ตั้งใจจัดการ:
 * - <input type="datetime-local"> คืน "yyyy-MM-ddTHH:mm" (ไม่มี offset) → `new Date(...)` ตีเป็น
 *   **เวลาท้องถิ่น** ซึ่งถูกต้องสำหรับปฏิทินโรงเรียน (เก็บลง DB เป็น UTC instant)
 * - <input type="date"> คืน "yyyy-MM-dd" → `new Date("yyyy-MM-dd")` ตีเป็น **UTC เที่ยงคืน**
 *   ทำให้เพี้ยนวันในบาง timezone → เราสร้างเป็นเที่ยงคืน "ท้องถิ่น" เองด้วย `new Date(y, m-1, d)`
 * - แสดงกลับในฟอร์มแก้ไขใช้ date-fns `format` ซึ่งอิง timezone ท้องถิ่นเช่นกัน → round-trip ตรง
 */

/** แปลงค่าจาก DB (Date) → string สำหรับ <input type=date|datetime-local> ในฟอร์มแก้ไข */
export function eventDateInputValue(date: Date | null | undefined, allDay: boolean): string {
  if (!date) return "";
  return allDay ? format(date, "yyyy-MM-dd") : format(date, "yyyy-MM-dd'T'HH:mm");
}

/**
 * แปลงค่า string จาก input → Date (null ถ้าว่าง/ไม่ถูกต้อง)
 * รับได้ทั้งรูป "yyyy-MM-dd" และ "yyyy-MM-ddTHH:mm" ไม่ว่า allDay จะเป็นอะไร
 * (ตอนสลับ allDay ค่าในช่องอาจยังเป็นรูปเดิมชั่วครู่ก่อน form จะ normalize)
 */
export function parseEventDateInput(value: string | null | undefined, allDay: boolean): Date | null {
  if (!value) return null;

  if (allDay) {
    // ใช้แค่ส่วนวันที่ แล้วสร้างเที่ยงคืน "ท้องถิ่น" (ไม่ให้ new Date ตีเป็น UTC)
    const [y, m, d] = value.slice(0, 10).split("-").map(Number);
    if (!y || !m || !d) return null;
    const date = new Date(y, m - 1, d);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

const DATE_FMT = "d MMM yy"; // 20 ก.ค. 69
const TIME_FMT = "HH:mm";

function sameCalendarDay(a: Date, b: Date): boolean {
  return format(a, "yyyy-MM-dd") === format(b, "yyyy-MM-dd");
}

/**
 * รูปแบบช่วงเวลาที่อ่านง่ายสำหรับตาราง/การ์ด (ภาษาไทย) — reuse ได้ที่หน้า public/ปฏิทินภายหลัง
 * ตัวอย่าง:
 *   allDay วันเดียว        → "20 ก.ค. 69"
 *   allDay ข้ามวัน         → "20 – 22 ก.ค. 69"
 *   มีเวลา วันเดียว        → "20 ก.ค. 69 09:00–12:00 น."
 *   มีเวลา ข้ามวัน         → "20 ก.ค. 69 09:00 น. – 22 ก.ค. 69 15:00 น."
 */
export function formatEventRange(
  startDate: Date,
  endDate: Date | null | undefined,
  allDay: boolean,
): string {
  const startDay = format(startDate, DATE_FMT, { locale: th });

  if (allDay) {
    if (!endDate || sameCalendarDay(startDate, endDate)) return startDay;
    const endDay = format(endDate, DATE_FMT, { locale: th });
    return `${startDay} – ${endDay}`;
  }

  const startTime = format(startDate, TIME_FMT);
  if (!endDate) return `${startDay} ${startTime} น.`;

  if (sameCalendarDay(startDate, endDate)) {
    return `${startDay} ${startTime}–${format(endDate, TIME_FMT)} น.`;
  }
  return `${startDay} ${startTime} น. – ${format(endDate, DATE_FMT, { locale: th })} ${format(endDate, TIME_FMT)} น.`;
}
