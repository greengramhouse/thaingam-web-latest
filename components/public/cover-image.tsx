import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { cloudinaryUrl } from "@/lib/image-url";

/**
 * รูปปกที่แสดง **ทั้งภาพ ไม่ครอป** — รองรับภาพแนวตั้ง/แนวนอนคละกัน
 *
 * มีสองโหมด:
 * - **กรอบตายตัว** (ค่าเริ่มต้น) — ภาพจริง `object-contain` ซ้อนบนพื้นหลังภาพเดิมเบลอ `object-cover`
 *   ใช้ตอนต้องการให้ทุกใบสูงเท่ากัน · โหลด URL เดียวกันทั้งสองชั้น เบราว์เซอร์ยิงเน็ตครั้งเดียว
 * - **`natural`** — ไม่มีกรอบ ภาพสูงตามสัดส่วนจริง ไม่ต้องมีพื้นหลังเบลอเพราะไม่เหลือที่ว่าง
 *
 * ⚠️ **โหมด `natural` ทำให้เกิด layout shift ตอนโหลด** — เราเก็บแค่ URL ลง DB ไม่ได้เก็บ
 *    width/height (แอดมินวางลิงก์โดเมนไหนก็ได้ ไม่ใช่แค่ Cloudinary) เบราว์เซอร์เลยจองที่ล่วงหน้าไม่ได้
 *    `bg-muted` ที่ wrapper ช่วยให้ไม่เห็นเป็นช่องขาววูบ · ถ้าจะกำจัดจริงต้องเก็บขนาดลง DB ตอนอัปโหลด
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
  natural = false,
  className,
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
  /** แสดงตามสัดส่วนจริงของภาพ ไม่ยัดลงกรอบ (`ratio` ถูกใช้เฉพาะตอนไม่มีรูป) */
  natural?: boolean;
  /** คลาสเพิ่มบน `<img>` — เช่น `max-h-[600px] w-auto` ตอนอยากจำกัดความสูงในโหมด natural */
  className?: string;
}) {
  if (!src) {
    return (
      <div className={cn("flex items-center justify-center overflow-hidden bg-muted text-muted-foreground", ratio, rounded)}>
        <ImageOff className={iconClassName} aria-hidden="true" />
      </div>
    );
  }

  const optimized = cloudinaryUrl(src, width);

  if (natural) {
    return (
      // wrapper มีไว้กันภาพล้นตอน hover scale เท่านั้น — **ห้ามใส่ `bg-muted` ที่นี่**
      // เพราะถ้าผู้เรียกจำกัดความกว้างภาพ (`w-auto` + `max-h-*`) พื้นหลังจะโผล่เป็นแถบเทาข้างภาพ
      <div className={cn("overflow-hidden", rounded)}>
        {/* eslint-disable-next-line @next/next/no-img-element -- URL จากโดเมนใดก็ได้ที่แอดมินวาง */}
        <img
          src={optimized}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : undefined}
          className={cn(
            "block h-auto w-full bg-muted transition-transform duration-300",
            rounded,
            hover && "group-hover:scale-[1.03]",
            className,
          )}
        />
      </div>
    );
  }

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
