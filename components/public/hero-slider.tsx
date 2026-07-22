"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type HeroBanner = { id: string; image: string; title: string | null; linkUrl: string | null };

/** สไลด์ภาพฝั่งขวาของ Hero — หมุนอัตโนมัติทุก 5 วิ + จุดบอกตำแหน่ง (กดเลือกได้) */
export function HeroSlider({ banners }: { banners: HeroBanner[] }) {
  const [index, setIndex] = useState(0);
  const count = banners.length;

  useEffect(() => {
    if (count <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 5000);
    return () => clearInterval(t);
  }, [count]);

  // ไม่มีแบนเนอร์ → กล่อง placeholder อมคราม
  if (count === 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-[20px] bg-white/10 text-center text-sm text-white/70 shadow-2xl ring-1 ring-white/15 lg:aspect-[4/3]">
        ภาพกิจกรรม/อาคารเรียน
        <br />
        (เพิ่มได้ที่เมนู “แบนเนอร์หน้าแรก”)
      </div>
    );
  }

  const current = banners[index];
  const img = (
    // eslint-disable-next-line @next/next/no-img-element -- URL จากโดเมนใดก็ได้ที่แอดมินวาง
    <img src={current.image} alt={current.title ?? ""} className="size-full object-cover" />
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-video w-full overflow-hidden rounded-[20px] shadow-2xl ring-1 ring-white/15 lg:aspect-[4/3]">
        {current.linkUrl ? <Link href={current.linkUrl}>{img}</Link> : img}
      </div>
      {count > 1 && (
        <div className="flex justify-center gap-2">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`สไลด์ที่ ${i + 1}`}
              aria-current={i === index}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}
