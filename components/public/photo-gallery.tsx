"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cloudinaryUrl } from "@/lib/image-url";

export type GalleryPhoto = { id: string; url: string; caption: string | null };

/** กริดรูป + lightbox — คลิกเปิดเต็มจอ เลื่อนซ้าย/ขวา, Esc ปิด, ลูกศรคีย์บอร์ด */
export function PhotoGallery({ photos }: { photos: GalleryPhoto[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)),
    [photos.length],
  );
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i + 1) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    // ล็อกสกอลล์พื้นหลังตอนเปิด lightbox
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIndex, close, prev, next]);

  const active = openIndex === null ? null : photos[openIndex];

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setOpenIndex(i)}
            className="group relative aspect-square overflow-hidden rounded-xl bg-muted"
            aria-label={p.caption ?? `ดูรูปที่ ${i + 1}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- URL จากโดเมนใดก็ได้ที่แอดมินวาง */}
            <img
              // รูปย่อในกริดใช้ขนาดเล็ก — ตัวเต็มค่อยโหลดตอนเปิด lightbox
              src={cloudinaryUrl(p.url, 400)}
              alt={p.caption ?? ""}
              loading="lazy"
              decoding="async"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </button>
        ))}
      </div>

      {active && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            aria-label="ปิด"
          >
            <X className="size-5" aria-hidden="true" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-3 flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:left-6"
                aria-label="รูปก่อนหน้า"
              >
                <ChevronLeft className="size-6" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-3 flex size-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:right-6"
                aria-label="รูปถัดไป"
              >
                <ChevronRight className="size-6" aria-hidden="true" />
              </button>
            </>
          )}

          <figure className="flex max-h-full max-w-4xl flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element -- URL จากโดเมนใดก็ได้ที่แอดมินวาง */}
            <img
              src={cloudinaryUrl(active.url, 1600)}
              alt={active.caption ?? ""}
              decoding="async"
              className="max-h-[80vh] w-auto rounded-lg object-contain"
            />
            <figcaption className="text-center text-sm text-white/80">
              {active.caption && <span className="mr-2">{active.caption}</span>}
              <span className="tabular-nums text-white/50">
                {(openIndex ?? 0) + 1} / {photos.length}
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
