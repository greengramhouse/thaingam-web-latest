/**
 * ย่อ/แปลงรูปของ **Cloudinary** ตอนแสดงผล — ประหยัด bandwidth ของโควตาฟรี
 *
 * ทำไมไม่ใช้ `next/image`: URL รูปในเว็บนี้มาจากโดเมนไหนก็ได้ที่แอดมินวางเอง
 * (Cloudinary / YouTube thumbnail / Google Drive / Dropbox) — `next/image` ต้องประกาศ `remotePatterns`
 * ล่วงหน้าทุกโดเมน ไม่งั้นรูปพัง ⇒ ใช้ `<img>` ธรรมดา แล้วฝากงานย่อไว้กับ CDN ของ Cloudinary แทน
 * (`f_auto` = เลือกฟอร์แมตให้เอง webp/avif · `q_auto` = คุมคุณภาพอัตโนมัติ · `w_` = กว้างสูงสุดที่ต้องใช้จริง)
 *
 * URL อื่นที่ไม่ใช่ Cloudinary คืนค่าเดิม (ไม่ยุ่ง)
 */
const CLOUDINARY_UPLOAD = "/image/upload/";

export function cloudinaryUrl(url: string | null | undefined, width?: number): string {
  if (!url) return "";
  const at = url.indexOf(CLOUDINARY_UPLOAD);
  if (at === -1 || !url.includes("res.cloudinary.com")) return url;

  const head = url.slice(0, at + CLOUDINARY_UPLOAD.length);
  const tail = url.slice(at + CLOUDINARY_UPLOAD.length);

  // ใส่ transform ซ้ำไม่ได้ทำให้พัง (Cloudinary ต่อ chain ให้) แต่กันไว้ไม่ให้ URL ยาวขึ้นเรื่อย ๆ
  if (/^(f_auto|q_auto|w_\d)/.test(tail)) return url;

  const transform = ["f_auto", "q_auto", width ? `w_${width}` : null, "c_limit"]
    .filter(Boolean)
    .join(",");
  return `${head}${transform}/${tail}`;
}
