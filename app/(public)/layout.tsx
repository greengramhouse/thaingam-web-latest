import { AnnouncementBar } from "@/components/public/announcement-bar";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

/**
 * เว็บสาธารณะใช้ฟอนต์ Inter + Anuphan ตาม DESIGN.md (ต่างจากหลังบ้านที่ใช้ Noto Sans Thai)
 * เรียง Inter ก่อน → ตัวเลข/ละตินคม, อักษรไทยตกไป Anuphan
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-full flex-col"
      style={{ fontFamily: "var(--font-inter), var(--font-anuphan), sans-serif" }}
    >
      <AnnouncementBar />
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
