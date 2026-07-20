"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { publicNav, publicNavExtra } from "@/components/public/public-nav";

export function MobileNav({ siteName }: { siteName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={<Button variant="ghost" size="icon" className="lg:hidden" aria-label="เปิดเมนู" />}
      >
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle className="text-left text-base">{siteName}</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-3" aria-label="เมนูหลัก">
          {[...publicNav, ...publicNavExtra].map((item, i) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <div key={item.href}>
                {i === publicNav.length && <div className="my-1 border-t border-border" />}
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-accent text-primary" : "text-foreground/80 hover:bg-accent",
                  )}
                >
                  {item.label}
                </Link>
              </div>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
