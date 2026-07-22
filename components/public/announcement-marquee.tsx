"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type Announcement = { id: string; message: string; linkUrl: string | null };

function Sep() {
  return (
    <span className="mx-6 text-primary-foreground/40" aria-hidden="true">
      •
    </span>
  );
}

/** รายการประกาศ 1 ชุด — คั่นด้วย • ระหว่างรายการ · `trailing` เติม • ท้ายสุด (คั่นก่อนชุดถัดไปตอน loop) */
function renderItems(items: Announcement[], trailing: boolean) {
  return (
    <>
      {items.map((a, i) => (
        <span key={a.id} className="inline-flex items-center whitespace-nowrap">
          {i > 0 && <Sep />}
          {a.linkUrl ? (
            <Link href={a.linkUrl} className="hover:underline">
              {a.message}
            </Link>
          ) : (
            <span>{a.message}</span>
          )}
        </span>
      ))}
      {trailing && <Sep />}
    </>
  );
}

/**
 * ข้อความประกาศ — **เลื่อน (marquee) เฉพาะตอนล้นกรอบ** (มือถือ/ข้อความยาว)
 * ถ้าพอดีกรอบ (จอกว้าง/ประกาศสั้น) → แสดงนิ่งชุดเดียว **ไม่ทำสำเนาซ้ำ** (กันเห็น 2 ชุดพร้อมกัน)
 * วัดด้วย ResizeObserver → รู้ทันทีเมื่อความกว้างเปลี่ยน · duplicate + `animate-marquee` (-50%) = วนไร้รอยต่อ
 */
export function AnnouncementMarquee({ items }: { items: Announcement[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const viewport = viewportRef.current;
    const copy = copyRef.current;
    if (!viewport || !copy) return;
    // ResizeObserver ยิง callback ทันทีตอน observe + ทุกครั้งที่ขนาดเปลี่ยน (setState ใน callback ไม่ใช่ใน effect body)
    const ro = new ResizeObserver(() => {
      setOverflowing(copy.scrollWidth > viewport.clientWidth + 1);
    });
    ro.observe(viewport);
    ro.observe(copy);
    return () => ro.disconnect();
  }, [items]);

  return (
    <div ref={viewportRef} className="relative min-w-0 flex-1 overflow-hidden">
      <div
        className={cn(
          "flex w-max",
          overflowing && "animate-marquee will-change-transform hover:[animation-play-state:paused]",
        )}
      >
        <div ref={copyRef} className="flex shrink-0 items-center">
          {renderItems(items, overflowing)}
        </div>
        {overflowing && (
          <div className="flex shrink-0 items-center" aria-hidden="true">
            {renderItems(items, true)}
          </div>
        )}
      </div>
      {/* fade ขอบไว้บังรอยต่อ "เฉพาะตอนเลื่อน" — ตอนนิ่งถ้ายังมี ตัวอักษรแรกจะจางติดป้ายประกาศ ดูเบียด */}
      {overflowing && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-primary to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-primary to-transparent" />
        </>
      )}
    </div>
  );
}
