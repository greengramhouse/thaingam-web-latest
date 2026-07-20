/**
 * แหล่งความจริงเดียวของ "ตั้งค่าเว็บไซต์" — ชุดคีย์คงที่ที่แอดมินแก้ได้
 * เก็บใน DB เป็น key-value (model SiteSetting) · key เป็น dotted เช่น "contact.phone"
 *
 * ⚠️ react-hook-form ตีชื่อ field ที่มี "." เป็น nested path → ใช้ `fieldName()` แปลง "." เป็น "__"
 *    สำหรับชื่อ field ในฟอร์ม/zod แล้วค่อย map กลับเป็น dotted key ตอนบันทึกลง DB
 *
 * pure — ไม่มี server-only เพราะทั้งฟอร์ม (client) และ action (server) import
 */

export type SettingInput = "text" | "url" | "email" | "tel" | "textarea";

export type SettingDef = {
  /** dotted key ที่เก็บลง DB เช่น "contact.phone" */
  key: string;
  label: string;
  input: SettingInput;
  placeholder?: string;
  help?: string;
};

export type SettingGroup = {
  title: string;
  description?: string;
  settings: SettingDef[];
};

export const SETTING_GROUPS: SettingGroup[] = [
  {
    title: "ข้อมูลทั่วไป",
    settings: [
      { key: "site.name", label: "ชื่อโรงเรียน", input: "text", placeholder: "โรงเรียนถ้ำงามวิทยา" },
      { key: "site.tagline", label: "คำโปรย / คำขวัญ", input: "text", placeholder: "เรียนดี มีวินัย ใฝ่คุณธรรม" },
    ],
  },
  {
    title: "ข้อมูลติดต่อ",
    description: "แสดงที่ส่วนท้ายเว็บ (Footer) และหน้าติดต่อเรา",
    settings: [
      { key: "contact.phone", label: "เบอร์โทรศัพท์", input: "tel", placeholder: "0XX-XXX-XXXX" },
      { key: "contact.email", label: "อีเมล", input: "email", placeholder: "school@example.ac.th" },
      { key: "contact.address", label: "ที่อยู่", input: "textarea", placeholder: "เลขที่ … ตำบล … อำเภอ … จังหวัด …" },
      { key: "contact.hours", label: "เวลาทำการ", input: "text", placeholder: "จันทร์–ศุกร์ 08:00–16:30 น." },
    ],
  },
  {
    title: "โซเชียลมีเดีย",
    description: "วางลิงก์เต็ม (ขึ้นต้น https://) เว้นว่างได้ถ้าไม่มี",
    settings: [
      { key: "social.facebook", label: "Facebook", input: "url", placeholder: "https://facebook.com/…" },
      { key: "social.youtube", label: "YouTube", input: "url", placeholder: "https://youtube.com/@…" },
      { key: "social.line", label: "LINE (ลิงก์เพิ่มเพื่อน)", input: "url", placeholder: "https://line.me/…" },
      { key: "social.tiktok", label: "TikTok", input: "url", placeholder: "https://tiktok.com/@…" },
    ],
  },
  {
    title: "แผนที่",
    settings: [
      {
        key: "map.embed",
        label: "Google Maps",
        input: "textarea",
        placeholder: 'วางลิงก์ share หรือโค้ด <iframe …> จาก Google Maps',
        help: "จาก Google Maps → แชร์ → ฝังแผนที่ → คัดลอกลิงก์หรือโค้ด iframe",
      },
    ],
  },
];

/** รายการ def ทั้งหมดแบบแบน */
export const ALL_SETTINGS: SettingDef[] = SETTING_GROUPS.flatMap((g) => g.settings);

/** คีย์ที่เป็น URL — ใช้ validate ฝั่ง action/zod */
export const URL_SETTING_KEYS = ALL_SETTINGS.filter((s) => s.input === "url").map((s) => s.key);

/** dotted key → ชื่อ field ในฟอร์ม (กัน RHF ตีเป็น nested path) */
export function fieldName(key: string): string {
  return key.replaceAll(".", "__");
}

/** ชื่อ field ในฟอร์ม → dotted key (กลับด้าน) */
export function keyFromField(name: string): string {
  return name.replaceAll("__", ".");
}
