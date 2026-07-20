import { existsSync } from "fs";
import path from "path";
import { cache } from "react";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ตราโรงเรียน — แสดงไฟล์จริงที่ `public/logo.png` ถ้ามี (เจ้าของวางเอง)
 * ถ้ายังไม่มีไฟล์ → fallback เป็นไอคอนในกรอบครามให้ไม่มีรูปแตก
 * (โลโก้ต้นฉบับจาก design เป็น PNG ความละเอียดสูง เกินขนาดที่ import อัตโนมัติได้)
 */
const hasLogoFile = cache(() => existsSync(path.join(process.cwd(), "public", "logo.png")));

export function SchoolLogo({ size = 46, className }: { size?: number; className?: string }) {
  if (hasLogoFile()) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- ไฟล์ static ในโดเมนเดียวกัน
      <img
        src="/logo.png"
        alt="ตราโรงเรียนชุมชนวัดไทยงาม"
        width={size}
        height={size}
        className={cn("object-contain", className)}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className={cn("flex shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground", className)}
      style={{ width: size, height: size }}
      aria-label="ตราโรงเรียนชุมชนวัดไทยงาม"
    >
      <GraduationCap style={{ width: size * 0.55, height: size * 0.55 }} aria-hidden="true" />
    </span>
  );
}
