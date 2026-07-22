import Link from "next/link";
import { Mail, MapPin, Phone, Link2 } from "lucide-react";
import { SchoolLogo } from "@/components/public/school-logo";
import { getSiteSettings } from "@/lib/site-settings-data";

const MENU_MAIN = [
  { href: "/news", label: "ข่าวสาร" },
  { href: "/works", label: "ผลงาน / สื่อการสอน" },
  { href: "/albums", label: "อัลบั้มภาพ" },
  { href: "/calendar", label: "ปฏิทินกิจกรรม" },
  { href: "/staff", label: "ทำเนียบบุคลากร" },
];
const MENU_INFO = [
  { href: "/about", label: "เกี่ยวกับโรงเรียน" },
  { href: "/documents", label: "ดาวน์โหลดเอกสาร" },
  { href: "/contact", label: "ติดต่อเรา" },
];

// ไอคอนแบรนด์ (lucide v1 ตัดออกแล้ว) → path ตรง ๆ สำหรับ facebook/youtube, อื่น ๆ ใช้ไอคอนลิงก์ทั่วไป
function SocialIcon({ kind }: { kind: string }) {
  if (kind === "facebook")
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    );
  if (kind === "youtube")
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23 12s0-3.5-.46-5.17a2.78 2.78 0 0 0-1.94-2C18.88 4.33 12 4.33 12 4.33s-6.88 0-8.6.5a2.78 2.78 0 0 0-1.94 2C1 8.5 1 12 1 12s0 3.5.46 5.17a2.78 2.78 0 0 0 1.94 2c1.72.5 8.6.5 8.6.5s6.88 0 8.6-.5a2.78 2.78 0 0 0 1.94-2C23 15.5 23 12 23 12zM9.75 15.5v-7l6 3.5z" />
      </svg>
    );
  return <Link2 className="size-[18px]" aria-hidden="true" />;
}

const SOCIALS = [
  { key: "social.facebook", kind: "facebook", label: "Facebook" },
  { key: "social.youtube", kind: "youtube", label: "YouTube" },
  { key: "social.line", kind: "line", label: "LINE" },
  { key: "social.tiktok", kind: "tiktok", label: "TikTok" },
];

export async function SiteFooter() {
  const s = await getSiteSettings();
  const siteName = s["site.name"] || "โรงเรียนชุมชนวัดไทยงาม";
  const siteNameEn = s["site.nameEn"] || "THAINGAM COMMUNITY SCHOOL";
  const tagline = s["site.tagline"] || "ดี · เก่ง · มีสุข";
  const socials = SOCIALS.filter((x) => s[x.key]);
  const yearBE = new Date().getFullYear() + 543;

  return (
    <footer className="bg-[#242B4E] text-white/75">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        {/* แบรนด์ */}
        <div>
          <div className="mb-4 flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-xl bg-white">
              <SchoolLogo size={36} />
            </span>
            <span className="leading-tight text-white">
              <span className="block text-[15px] font-semibold">{siteName}</span>
              <span className="block text-[11px] text-white/55">{siteNameEn}</span>
            </span>
          </div>
          <p className="max-w-xs text-[13.5px] leading-relaxed">
            จัดการศึกษาที่มีคุณภาพ ควบคู่คุณธรรม ภายใต้ปรัชญา “{tagline}”
          </p>
        </div>

        {/* เมนูหลัก */}
        <FooterCol title="เมนูหลัก" links={MENU_MAIN} />
        {/* ข้อมูล */}
        <FooterCol title="ข้อมูล" links={MENU_INFO} />

        {/* ติดต่อ */}
        <div>
          <h4 className="mb-3.5 text-sm font-semibold text-white">ติดต่อ</h4>
          <div className="flex flex-col gap-2.5 text-[13.5px]">
            {s["contact.address"] && (
              <span className="flex gap-2.5">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                <span className="whitespace-pre-line">{s["contact.address"]}</span>
              </span>
            )}
            {s["contact.phone"] && (
              <a href={`tel:${s["contact.phone"]}`} className="flex items-center gap-2.5 hover:text-white">
                <Phone className="size-4 shrink-0" aria-hidden="true" />
                <span className="tabular-nums">{s["contact.phone"]}</span>
              </a>
            )}
            {s["contact.email"] && (
              <a href={`mailto:${s["contact.email"]}`} className="flex items-center gap-2.5 hover:text-white">
                <Mail className="size-4 shrink-0" aria-hidden="true" />
                {s["contact.email"]}
              </a>
            )}
          </div>
          {socials.length > 0 && (
            <div className="mt-4 flex gap-2.5">
              {socials.map((x) => (
                <a
                  key={x.key}
                  href={s[x.key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={x.label}
                  className="flex size-9 items-center justify-center rounded-[10px] bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <SocialIcon kind={x.kind} />
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1200px] flex-wrap justify-between gap-2 px-4 py-4 text-[12.5px] text-white/50 sm:px-6">
          <span>© {yearBE} {siteName} · สงวนลิขสิทธิ์</span>
          <span>ออกแบบด้วยความตั้งใจ เพื่อการศึกษาที่ดีกว่า</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h4 className="mb-3.5 text-sm font-semibold text-white">{title}</h4>
      <div className="flex flex-col gap-2.5 text-[13.5px]">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-white">
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
