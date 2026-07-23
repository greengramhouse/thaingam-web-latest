"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

/**
 * ช่องค้นหาของหน้า `/search` — **กด Enter/ปุ่มถึงจะค้น** (ไม่ debounce แบบ `table-search`)
 * เพราะหน้านี้ยิง query 3 ตาราง ไม่ควรยิงใหม่ทุกตัวอักษร
 */
export function SearchBox({ defaultValue = "" }: { defaultValue?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
      }}
      className="flex w-full gap-2"
      role="search"
    >
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-[18px] -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="พิมพ์คำที่ต้องการค้นหา…"
          aria-label="คำค้นหา"
          className="h-12 bg-card pl-10 text-base"
        />
      </div>
      <Button type="submit" className="h-12 px-6 font-semibold">
        ค้นหา
      </Button>
    </form>
  );
}
