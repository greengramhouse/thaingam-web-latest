"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, Menu, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { SidebarNav } from "@/components/admin/sidebar-nav";
import { UserMenu } from "@/components/admin/user-menu";

type AdminUser = {
  name: string;
  email: string;
  image?: string | null;
  role?: string | null;
};

function Brand() {
  return (
    <Link
      href="/admin"
      className="flex items-center gap-3 border-b border-border px-5 py-4"
      aria-label="แดชบอร์ดหลังบ้าน"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
        <School className="size-[22px]" aria-hidden="true" />
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block text-sm font-semibold text-primary">ระบบหลังบ้าน</span>
        <span className="block truncate text-[11.5px] text-muted-foreground">
          โรงเรียนชุมชนวัดไทยงาม
        </span>
      </span>
    </Link>
  );
}

export function AdminShell({ user, children }: { user: AdminUser; children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-svh">
      {/* Sidebar ถาวร — desktop เท่านั้น */}
      <aside className="hidden w-[260px] shrink-0 border-r border-border bg-sidebar lg:flex lg:flex-col">
        <Brand />
        <div className="flex-1 overflow-y-auto">
          <SidebarNav role={user.role} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-[60px] items-center gap-2 border-b border-border bg-background/90 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:px-6">
          {/* Sidebar แบบ drawer — mobile/tablet */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={<Button variant="ghost" size="icon" className="lg:hidden" aria-label="เปิดเมนู" />}
            >
              <Menu className="size-5" aria-hidden="true" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">เมนูหลังบ้าน</SheetTitle>
              <Brand />
              <div className="flex-1 overflow-y-auto">
                {/* ปิด drawer เมื่อกดเมนู — pathname เปลี่ยนแต่ layout ไม่ remount */}
                <SidebarNav role={user.role} onNavigate={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          <span className="truncate font-medium lg:hidden">ระบบหลังบ้าน</span>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            {/* nativeButton={false} เพราะ render เป็น <a> ไม่ใช่ <button> — Base UI default เป็น true */}
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href="/" target="_blank" rel="noopener noreferrer" />}
            >
              <ExternalLink aria-hidden="true" />
              <span className="hidden sm:inline">ดูเว็บไซต์</span>
            </Button>
            <div className="hidden h-6 w-px bg-border sm:block" aria-hidden="true" />
            <UserMenu user={user} />
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
