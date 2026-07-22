/**
 * class สำหรับ render เนื้อหา rich text (HTML จาก Tiptap) ฝั่ง public
 * ใช้ arbitrary-variant เหมือน editor (`components/admin/rich-text-editor.tsx`) แต่ขนาดใหญ่/เว้นบรรทัดกว่า
 * ใช้ร่วมกันที่ news detail · works detail (ARTICLE) · หน้า `Page` (Phase 4.6)
 * ⚠️ sanitize HTML ก่อน render ยกไปทำที่ Phase 4.8 (เนื้อหาเขียนโดยแอดมินที่เชื่อถือได้)
 */
export const articleProse =
  "text-[16px] leading-[1.85] text-foreground/90 [&_p]:my-4 [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-[22px] [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_ul]:my-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:my-1 [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_img]:my-5 [&_img]:rounded-xl [&_iframe]:my-5 [&_iframe]:aspect-video [&_iframe]:h-auto [&_iframe]:w-full [&_iframe]:rounded-xl";
