/**
 * ตัวช่วยเอกสารดาวน์โหลด — ทั้งหมด pure (ไม่มี server-only) เพราะ validation/ฟอร์มฝั่ง client อาจ import
 *
 * fileType เก็บ "เฉพาะที่แอดมินตั้งเอง" (null = ยังไม่ตั้ง) แล้ว **เดาจากนามสกุลใน fileUrl ตอนแสดงผล**
 * (หลักการเดียวกับรูปปก YouTube — ไม่เก็บค่าที่คำนวณได้ลง DB · problems.md 8.3)
 */

const EXT_LABELS: Record<string, string> = {
  pdf: "PDF",
  doc: "DOC",
  docx: "DOCX",
  xls: "XLS",
  xlsx: "XLSX",
  ppt: "PPT",
  pptx: "PPTX",
  txt: "TXT",
  csv: "CSV",
  zip: "ZIP",
  rar: "RAR",
  jpg: "JPG",
  jpeg: "JPG",
  png: "PNG",
};

/** ดึงนามสกุลไฟล์จาก URL (ตัด query/hash) — คืน lowercase หรือ null ถ้าเดาไม่ได้ */
export function extFromUrl(url: string): string | null {
  try {
    const path = new URL(url).pathname;
    const match = /\.([a-z0-9]{1,5})$/i.exec(path);
    return match ? match[1].toLowerCase() : null;
  } catch {
    // ไม่ใช่ URL สมบูรณ์ — ลองจับตรง ๆ
    const match = /\.([a-z0-9]{1,5})(?:[?#]|$)/i.exec(url);
    return match ? match[1].toLowerCase() : null;
  }
}

/** ป้ายชนิดไฟล์สำหรับแสดงผล — ใช้ที่แอดมินตั้งก่อน ถ้าว่างเดาจากนามสกุล ไม่ได้เลยคืน "ไฟล์" */
export function documentFileLabel(fileType: string | null | undefined, fileUrl: string): string {
  if (fileType && fileType.trim()) return fileType.trim().toUpperCase();
  const ext = extFromUrl(fileUrl);
  if (!ext) return "ไฟล์";
  return EXT_LABELS[ext] ?? ext.toUpperCase();
}
