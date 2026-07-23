import type { Metadata } from "next";
import { Noto_Sans_Thai, Anuphan, Inter } from "next/font/google";
import { siteUrl } from "@/lib/site-url";
import { SITE_DESCRIPTION, SITE_NAME, buildOpenGraph, buildTwitter } from "@/lib/metadata";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-sans",
  subsets: ["thai", "latin"],
  display: "swap",
});

// เพิ่มไว้ให้หน้า auth (ตาม DESIGN.md: Inter สำหรับละติน/ตัวเลข + Anuphan สำหรับไทย)
// ยังไม่ตั้งเป็นฟอนต์เริ่มต้นทั้งเว็บ — หลังบ้านยังใช้ Noto Sans Thai อยู่
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const anuphan = Anuphan({
  variable: "--font-anuphan",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  // ทำให้ path สัมพัทธ์ (เช่น /og.png) กลายเป็น absolute URL — ต้องมี ไม่งั้น OG/Twitter อ่านรูปไม่ได้
  metadataBase: new URL(siteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  // ค่าเริ่มต้นให้หน้าที่ไม่ได้ประกาศ openGraph เอง
  // ⚠️ ไม่ใส่ title/description ตรงนี้ — Next merge แบบ shallow แต่ค่าที่ "ไม่ได้ตั้ง" จะตกไปใช้ title/description
  //    ของหน้านั้น ๆ ให้เอง (ถ้าตั้งไว้ ทุกหน้าจะได้ og:title เป็นชื่อเว็บหมด)
  openGraph: buildOpenGraph({ path: "/" }),
  twitter: buildTwitter({}),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="th"
      className={`${notoSansThai.variable} ${inter.variable} ${anuphan.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
