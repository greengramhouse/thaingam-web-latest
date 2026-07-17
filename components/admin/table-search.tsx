"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

/**
 * ช่องค้นหาที่เขียนค่าลง URL (?q=) — ให้ Server Component อ่านไปทำ query เอง
 * URL เป็นแหล่งความจริง → refresh/แชร์ลิงก์แล้วผลค้นหายังอยู่
 */
export function TableSearch({ placeholder = "ค้นหา…" }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    const current = searchParams.get("q") ?? "";
    if (value === current) return;

    // debounce กันยิง query ทุกตัวอักษร
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams);
      if (value) params.set("q", value);
      else params.delete("q");
      // ค้นใหม่ต้องกลับไปหน้า 1 ไม่งั้นค้างหน้าที่ไม่มีผลลัพธ์
      params.delete("page");
      router.replace(`${pathname}?${params}`);
    }, 350);

    return () => clearTimeout(timer);
  }, [value, searchParams, pathname, router]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="pl-8"
      />
    </div>
  );
}
