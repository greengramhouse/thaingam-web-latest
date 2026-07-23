import { AnnouncementBar } from "@/components/public/announcement-bar";
import { SiteHeader } from "@/components/public/site-header";
import { SiteFooter } from "@/components/public/site-footer";

/** เลย์เอาต์เว็บสาธารณะ — ฟอนต์ Inter + Anuphan ตั้งเป็นค่าเริ่มต้นทั้งเว็บแล้วที่ `globals.css` */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-col">
      {/* ลิงก์ข้ามไปเนื้อหา — คนใช้คีย์บอร์ด/screen reader กด Tab ครั้งแรกจะเจออันนี้ ไม่ต้องไล่ผ่านเมนูทุกครั้ง
          (ซ่อนไว้จนกว่าจะโฟกัส) */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
      >
        ข้ามไปยังเนื้อหาหลัก
      </a>
      <AnnouncementBar />
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
