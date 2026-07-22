import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * รูปปกที่แสดง **ทั้งภาพ ไม่ครอป** — รองรับภาพแนวตั้ง/แนวนอนคละกัน
 *
 * ภาพจริง = `object-contain` (เห็นเต็มใบ) ซ้อนบนพื้นหลัง = ภาพเดิมเบลอ `object-cover`
 * (เติมกรอบให้เต็ม ไม่เหลือช่องว่างโล่ง) · โหลด URL เดียวกัน browser cache ให้ ยิงเน็ตครั้งเดียว
 */
export function CoverImage({
  src,
  alt = "",
  ratio = "aspect-[16/9]",
  rounded,
  hover = false,
  iconClassName = "size-8",
}: {
  src: string | null;
  alt?: string;
  ratio?: string;
  rounded?: string;
  hover?: boolean;
  iconClassName?: string;
}) {
  if (!src) {
    return (
      <div className={cn("flex items-center justify-center overflow-hidden bg-muted text-muted-foreground", ratio, rounded)}>
        <ImageOff className={iconClassName} aria-hidden="true" />
      </div>
    );
  }

  return (
    <div className={cn("relative overflow-hidden bg-muted", ratio, rounded)}>
      {/* พื้นหลังเบลอเติมกรอบ */}
      {/* eslint-disable-next-line @next/next/no-img-element -- URL จากโดเมนใดก็ได้ที่แอดมินวาง */}
      <img src={src} alt="" aria-hidden="true" className="absolute inset-0 size-full scale-110 object-cover blur-2xl" />
      {/* ภาพจริง เห็นเต็มใบ */}
      {/* eslint-disable-next-line @next/next/no-img-element -- URL จากโดเมนใดก็ได้ที่แอดมินวาง */}
      <img
        src={src}
        alt={alt}
        className={cn(
          "relative size-full object-contain transition-transform duration-300",
          hover && "group-hover:scale-105",
        )}
      />
    </div>
  );
}
