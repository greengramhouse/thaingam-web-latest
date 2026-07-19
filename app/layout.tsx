import type { Metadata } from "next";
import { Noto_Sans_Thai, Anuphan, Inter } from "next/font/google";
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
  title: {
    default: "โรงเรียนชุมชนวัดไทยงาม",
    template: "%s | โรงเรียนชุมชนวัดไทยงาม",
  },
  description:
    "เว็บไซต์ประชาสัมพันธ์โรงเรียนชุมชนวัดไทยงาม — ข่าวสาร ผลงาน/สื่อการสอน ปฏิทินกิจกรรม และข้อมูลโรงเรียน",
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
