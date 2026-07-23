import "server-only";
import sanitizeHtml from "sanitize-html";

/**
 * ล้าง HTML จาก Tiptap ก่อนเอาไปใส่ `dangerouslySetInnerHTML` ในหน้า public
 *
 * **ทำไมต้องล้างทั้งที่คนพิมพ์คือแอดมิน:** ถ้าบัญชีแอดมินหลุด (หรือ ADMIN ที่ไม่ควรเชื่อ 100%)
 * แปะ `<script>`/`<img onerror=…>` เข้าเนื้อหาข่าวได้ = XSS ยิงใส่ผู้เข้าชมทุกคน + ขโมย session แอดมินคนอื่น
 * → กัน**ตอนแสดงผล** ไม่ใช่ตอนบันทึก (เนื้อหาเก่าที่อยู่ใน DB แล้วก็ปลอดภัยด้วย · เปลี่ยนกฎทีหลังไม่ต้องแก้ข้อมูล)
 *
 * **allowlist ตามที่ editor สร้างได้จริง** (StarterKit + `extension-image` + `extension-youtube`)
 * เพิ่มแท็กใหม่ในนี้เมื่อเพิ่ม extension ให้ editor เท่านั้น
 */

/** โดเมนที่ยอมให้ฝัง iframe ได้ — Tiptap Youtube ตั้ง `nocookie: true` */
const ALLOWED_IFRAME_HOSTS = ["www.youtube-nocookie.com", "youtube-nocookie.com", "www.youtube.com", "youtube.com"];

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p", "br", "hr",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "strong", "b", "em", "i", "s", "strike", "u", "code", "pre",
    "ul", "ol", "li", "blockquote",
    "a", "img", "iframe", "div", "span",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "class"],
    iframe: ["src", "width", "height", "allow", "allowfullscreen", "frameborder", "title"],
    div: ["data-youtube-video"],
    span: [],
    "*": [],
  },
  // ยอมเฉพาะ protocol ที่ปลอดภัย → ตัด `javascript:` ทิ้งอัตโนมัติ
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: { img: ["http", "https", "data"] },
  allowProtocolRelative: false,
  // ลิงก์ออกนอกเว็บต้องมี rel กัน tabnabbing (`window.opener`)
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: {
        ...attribs,
        ...(attribs.target === "_blank" || attribs.href?.startsWith("http")
          ? { rel: "noopener noreferrer" }
          : {}),
      },
    }),
  },
  allowedIframeHostnames: ALLOWED_IFRAME_HOSTS,
  // ทิ้งเนื้อหาข้างในไปด้วย ไม่ใช่เก็บ text ของ <script> มาโชว์เป็นตัวอักษร
  nonTextTags: ["script", "style", "textarea", "option", "noscript"],
};

/** คืน HTML ที่ปลอดภัยพอจะใส่ `dangerouslySetInnerHTML` ได้ */
export function sanitizeRichText(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, OPTIONS);
}
