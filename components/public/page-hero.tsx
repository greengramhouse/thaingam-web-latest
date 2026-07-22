import Link from "next/link";

/**
 * แถบหัวเรื่องไล่เฉดครามของหน้าเนื้อหาสาธารณะ (ข่าว/ผลงาน/บุคลากร ฯลฯ)
 * ตาม mockup Public Pages — breadcrumb + หัวเรื่อง + คำโปรย
 */
export function PageHero({
  title,
  subtitle,
  breadcrumb,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
}) {
  return (
    <div className="bg-gradient-to-br from-[#3B4680] to-primary text-primary-foreground">
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 sm:py-11">
        <nav className="mb-2 text-[13px] text-primary-foreground/70">
          <Link href="/" className="hover:text-primary-foreground">
            หน้าแรก
          </Link>
          {breadcrumb && <span> / {breadcrumb}</span>}
        </nav>
        <h1 className="text-[28px] font-bold tracking-tight sm:text-[34px]">{title}</h1>
        {subtitle && <p className="mt-2 text-[15px] text-primary-foreground/80 sm:text-base">{subtitle}</p>}
      </div>
    </div>
  );
}
