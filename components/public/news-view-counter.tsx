"use client";

import { useEffect, useRef } from "react";
import { incrementNewsView } from "@/server/actions/news-view";

/**
 * นับยอดวิวหนึ่งครั้งตอนหน้าเปิดจริง (ไม่ใช่ตอน render) — ทำใน useEffect
 * `useRef` กันยิงซ้ำจาก double-invoke ของ React Strict Mode (dev) · ไม่แสดงผลอะไร
 */
export function NewsViewCounter({ id }: { id: string }) {
  const counted = useRef(false);

  useEffect(() => {
    if (counted.current) return;
    counted.current = true;
    void incrementNewsView(id);
  }, [id]);

  return null;
}
