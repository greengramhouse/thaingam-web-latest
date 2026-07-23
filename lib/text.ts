/**
 * แปลง HTML จาก Tiptap → ข้อความล้วน สำหรับทำคำโปรย/ตัวอย่างผลค้นหา
 *
 * ใช้เฉพาะกรณีที่จะ **แสดงเป็นข้อความ** (React escape ให้เองอยู่แล้ว)
 * ไม่ใช่ตัว sanitize สำหรับ `dangerouslySetInnerHTML` — อันนั้นแยกทำใน Phase 4.8
 */
export function htmlToText(html: string): string {
  return html
    // แท็กปิดบล็อก → เว้นวรรค ไม่งั้นคำท้ายย่อหน้าติดกับคำแรกของย่อหน้าถัดไป
    .replace(/<\/(p|div|h[1-6]|li|br|tr)>/gi, " ")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/** ข้อความล้วนแบบตัดความยาว (ต่อท้ายด้วย … ถ้าโดนตัด) */
export function excerptFromHtml(html: string, maxLength = 160): string {
  const text = htmlToText(html);
  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
}
