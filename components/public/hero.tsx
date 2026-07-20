import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { HeroSlider, type HeroBanner } from "@/components/public/hero-slider";
import { getSiteSettings } from "@/lib/site-settings-data";

const DEFAULT_TITLE = "มุ่งพัฒนาผู้เรียน สู่ความเป็นเลิศ อย่างมีความสุข";
const DEFAULT_SUBTITLE =
  "โรงเรียนชุมชนวัดไทยงาม จัดการศึกษาที่มีคุณภาพ ควบคู่คุณธรรม เพื่อพัฒนาเยาวชนให้เป็นคนดี คนเก่ง และอยู่ในสังคมได้อย่างมีความสุข";

export async function Hero({ banners }: { banners: HeroBanner[] }) {
  const s = await getSiteSettings();
  const title = s["home.heroTitle"] || DEFAULT_TITLE;
  const subtitle = s["home.heroSubtitle"] || DEFAULT_SUBTITLE;
  const tagline = s["site.tagline"] || "ดี · เก่ง · มีสุข";

  const stats = [
    { value: s["home.statStudents"], label: "นักเรียน" },
    { value: s["home.statTeachers"], label: "คุณครู" },
    { value: s["home.statFounded"], label: "ปีก่อตั้ง" },
  ].filter((x) => x.value);

  return (
    <section className="relative overflow-hidden bg-[linear-gradient(155deg,#3B4680_0%,#333D6D_50%,#242B4E_100%)] text-white">
      {/* วงกลมเรืองแสงตกแต่ง */}
      <div className="pointer-events-none absolute -right-16 -top-24 size-80 rounded-full bg-[radial-gradient(circle,rgba(46,155,214,.35),transparent_70%)]" />
      <div className="pointer-events-none absolute -bottom-32 left-[10%] size-80 rounded-full bg-[radial-gradient(circle,rgba(47,191,160,.2),transparent_70%)]" />

      <div className="relative mx-auto grid max-w-[1200px] items-center gap-12 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
        <div>
          <span className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full bg-white/12 px-4 py-1.5 text-sm font-medium">
            <span className="size-1.5 shrink-0 rounded-full bg-mint" />
            <span className="truncate">{tagline}</span>
          </span>
          <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[48px] lg:leading-[1.12]">
            {title}
          </h1>
          <p className="mb-8 max-w-lg text-base leading-relaxed text-white/80 sm:text-[17px]">{subtitle}</p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admission"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-primary transition-colors hover:bg-white/90"
            >
              สมัครเรียน
              <ArrowRight className="size-[18px]" aria-hidden="true" />
            </Link>
            <Link
              href="/about"
              className="inline-flex h-12 items-center rounded-xl border border-white/25 bg-white/12 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-white/20"
            >
              รู้จักโรงเรียน
            </Link>
          </div>
        </div>

        <div className="relative">
          <HeroSlider banners={banners} />
          {stats.length > 0 && (
            <div className="mt-4 flex justify-center gap-5 rounded-2xl bg-card px-5 py-4 text-card-foreground shadow-xl sm:gap-6 lg:absolute lg:-bottom-5 lg:-left-5 lg:mt-0">
              {stats.map((stat, i) => (
                <div key={stat.label} className="flex items-center gap-5 sm:gap-6">
                  {i > 0 && <span className="h-9 w-px bg-border" />}
                  <div className="text-center">
                    <div className="text-2xl font-bold tabular-nums text-primary">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
