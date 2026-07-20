import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DesktopNav } from "@/components/public/desktop-nav";
import { MobileNav } from "@/components/public/mobile-nav";
import { SchoolLogo } from "@/components/public/school-logo";
import { getSiteSettings } from "@/lib/site-settings-data";

export async function SiteHeader() {
  const settings = await getSiteSettings();
  const siteName = settings["site.name"] || "โรงเรียนชุมชนวัดไทยงาม";
  const siteNameEn = settings["site.nameEn"] || "THAINGAM COMMUNITY SCHOOL";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-[72px] max-w-[1200px] items-center gap-3 px-4 sm:px-6">
        <MobileNav siteName={siteName} />

        <Link href="/" className="flex items-center gap-3">
          <SchoolLogo size={46} />
          <span className="leading-tight">
            <span className="block text-[15px] font-bold text-primary sm:text-base">{siteName}</span>
            <span className="hidden text-[11px] tracking-wide text-muted-foreground sm:block">{siteNameEn}</span>
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <DesktopNav />
          <Button
            variant="outline"
            size="icon"
            nativeButton={false}
            render={<Link href="/search" />}
            aria-label="ค้นหา"
          >
            <Search />
          </Button>
          <Button
            nativeButton={false}
            render={<Link href="/contact" />}
            className="hidden font-semibold sm:inline-flex"
          >
            ติดต่อเรา
          </Button>
        </div>
      </div>
    </header>
  );
}
