import { formatThaiDateTime } from "@/lib/date";

/**
 * Helpers ของแถบประกาศด่วน — pure ใช้ได้ทั้ง client และ server (ห้ามใส่ `server-only`)
 * วันที่ใช้ <input type="datetime-local"> → parse/format ผ่าน lib/event (จัดการ timezone ให้แล้ว)
 */

/** สถานะการแสดงผลของประกาศเทียบกับเวลาปัจจุบัน (ใช้โชว์ป้ายในตารางแอดมิน) */
export type AnnouncementLiveState = "hidden" | "scheduled" | "live" | "expired";

export function announcementLiveState(
  isActive: boolean,
  startsAt: Date | null | undefined,
  endsAt: Date | null | undefined,
  now: Date,
): AnnouncementLiveState {
  if (!isActive) return "hidden";
  if (startsAt && now < startsAt) return "scheduled";
  if (endsAt && now > endsAt) return "expired";
  return "live";
}

/** ข้อความช่วงเวลาแบบอ่านง่าย (ภาษาไทย) — "—" ถ้าไม่กำหนดทั้งคู่ */
export function formatAnnouncementWindow(
  startsAt: Date | null | undefined,
  endsAt: Date | null | undefined,
): string {
  const start = startsAt ? formatThaiDateTime(startsAt, "short") : null;
  const end = endsAt ? formatThaiDateTime(endsAt, "short") : null;

  if (start && end) return `${start} น. – ${end} น.`;
  if (start) return `ตั้งแต่ ${start} น.`;
  if (end) return `ถึง ${end} น.`;
  return "—";
}
