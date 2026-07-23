import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { cloudinaryUrl } from "@/lib/image-url";

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
  width = 800,
  priority = false,
}: {
  src: string | null;
  alt?: string;
  ratio?: string;
  rounded?: string;
  hover?: boolean;
  iconClassName?: string;
  /** ความกว้างสูงสุดที่ใช้จริง — ส่งต่อให้ Cloudinary ย่อ (รูปโดเมนอื่นไม่มีผล) */
  width?: number;
  /** รูปเด่นบนสุดของหน้า (LCP) → โหลดทันทีไม่ lazy */
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div className={cn("flex items-center justify-center overflow-hidden bg-muted text-muted-foreground", ratio, rounded)}>
        <ImageOff className={iconClassName} aria-hidden="true" />
      </div>
    );
  }

  // โหลด URL เดียวกันทั้งพื้นหลังเบลอและภาพจริง → เบราว์เซอร์ยิงเน็ตครั้งเดียว
  const optimized = cloudinaryUrl(src, width);

  return (
    <div className={cn("relative overflow-hidden bg-muted", ratio, rounded)}>
      {/* พื้นหลังเบลอเติมกรอบ */}
      {/* eslint-disable-next-line @next/next/no-img-element -- URL จากโดเมนใดก็ได้ที่แอดมินวาง */}
      <img
        src={optimized}
        alt=""
        aria-hidden="true"
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="absolute inset-0 size-full scale-110 object-cover blur-2xl"
      />
      {/* ภาพจริง เห็นเต็มใบ */}
      {/* eslint-disable-next-line @next/next/no-img-element -- URL จากโดเมนใดก็ได้ที่แอดมินวาง */}
      <img
        src={optimized}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : undefined}
        className={cn(
          "relative size-full object-contain transition-transform duration-300",
          hover && "group-hover:scale-105",
        )}
      />
    </div>
  );
}
