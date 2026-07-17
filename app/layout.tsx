import type { Metadata } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({
  variable: "--font-sans",
  subsets: ["thai", "latin"],
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
    <html lang="th" className={`${notoSansThai.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
