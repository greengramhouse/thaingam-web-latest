import { extractYoutubeId, youtubeThumbnailUrl } from "@/lib/youtube";

/**
 * รูปปกที่ควรแสดงจริง — **คำนวณตอนแสดงผล ไม่เก็บลง DB**
 *
 * `thumbnail` ใน DB = สิ่งที่แอดมินตั้งเองเท่านั้น (null = ยังไม่ได้ตั้ง)
 * ถ้าไม่ได้ตั้งและเป็น YouTube → ใช้รูปปกของคลิปนั้น
 *
 * 🐛 **ทำไมไม่เก็บค่าที่ derive ลง DB** (เจอตอน Phase 4.4.3 ก่อนขึ้นจริง):
 *    ถ้าเก็บ พอเปิดหน้าแก้ไข ฟอร์มจะโหลดรูปที่ derive ไว้กลับมาเป็นค่าในช่อง
 *    → กลายเป็น "ค่าที่แอดมินตั้งเอง" แยกไม่ออก → เปลี่ยนลิงก์คลิปทีหลัง
 *    รูปปกยังชี้คลิปเก่าเงียบ ๆ (พิสูจน์แล้วว่าเกิดจริง)
 */
export function mediaWorkThumbnail(work: {
  thumbnail?: string | null;
  type: string;
  youtubeUrl?: string | null;
}): string | null {
  if (work.thumbnail) return work.thumbnail;
  if (work.type !== "YOUTUBE" || !work.youtubeUrl) return null;

  const id = extractYoutubeId(work.youtubeUrl);
  return id ? youtubeThumbnailUrl(id) : null;
}
