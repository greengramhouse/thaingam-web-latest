import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Compass, Heart, Target } from "lucide-react";
import { getSiteSettings } from "@/lib/site-settings-data";
import { schoolJsonLd } from "@/lib/structured-data";
import { PageHero } from "@/components/public/page-hero";
import { JsonLd } from "@/components/public/json-ld";

export const metadata: Metadata = {
  title: "เกี่ยวกับเรา",
  description: "แนะนำโรงเรียนชุมชนวัดไทยงาม ปรัชญา วิสัยทัศน์ และพันธกิจ",
};

const VALUES = [
  {
    icon: Heart,
    title: "ปรัชญา",
    body: "มุ่งพัฒนาผู้เรียนให้เป็นคนดี มีความรู้คู่คุณธรรม และดำรงชีวิตในสังคมได้อย่างมีความสุข",
    tint: "bg-secondary text-primary",
  },
  {
    icon: Compass,
    title: "วิสัยทัศน์",
    body: "เป็นโรงเรียนคุณภาพของชุมชน จัดการศึกษาที่ทันสมัย ควบคู่การอนุรักษ์ศิลปวัฒนธรรมท้องถิ่น",
    tint: "bg-sky-muted text-sky-foreground",
  },
  {
    icon: Target,
    title: "พันธกิจ",
    body: "ส่งเสริมการเรียนรู้ที่เน้นผู้เรียนเป็นสำคัญ พัฒนาครูและบุคลากร และสร้างความร่วมมือกับชุมชน",
    tint: "bg-mint-muted text-mint-foreground",
  },
];

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const siteName = settings["site.name"] || "โรงเรียนชุมชนวัดไทยงาม";
  const tagline = settings["site.tagline"];

  return (
    <>
      {/* หน้า "เกี่ยวกับ" เป็นอีกจุดที่ Google อ่านข้อมูลองค์กร (@id เดียวกับหน้าแรก → ไม่นับซ้ำ) */}
      <JsonLd data={await schoolJsonLd()} />
      <PageHero
        breadcrumb="เกี่ยวกับเรา"
        title="เกี่ยวกับโรงเรียน"
        subtitle={tagline || "แนะนำโรงเรียน ปรัชญา วิสัยทัศน์ และพันธกิจของเรา"}
      />

      <div className="mx-auto max-w-[860px] px-4 py-11 pb-16 sm:px-6">
        <section>
          <h2 className="text-2xl font-bold tracking-tight">ยินดีต้อนรับสู่{siteName}</h2>
          <div className="mt-4 space-y-4 text-[16px] leading-[1.85] text-foreground/90">
            <p>
              {siteName}
              เป็นสถานศึกษาที่มุ่งมั่นจัดการศึกษาให้แก่เด็กและเยาวชนในชุมชน
              ด้วยความเชื่อว่าการศึกษาที่ดีคือรากฐานสำคัญของการพัฒนาชีวิตและสังคม
            </p>
            <p>
              เราให้ความสำคัญกับการดูแลผู้เรียนอย่างใกล้ชิด ควบคู่ไปกับการปลูกฝังคุณธรรม จริยธรรม
              และทักษะที่จำเป็นสำหรับโลกยุคใหม่ เพื่อให้นักเรียนทุกคนเติบโตเป็นพลเมืองที่ดีและมีคุณภาพ
            </p>
          </div>
        </section>

        <section className="mt-10 grid gap-5 sm:grid-cols-3">
          {VALUES.map((v) => (
            <div key={v.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className={`flex size-11 items-center justify-center rounded-xl ${v.tint}`}>
                <v.icon className="size-5" aria-hidden="true" />
              </div>
              <h3 className="mt-3.5 mb-1.5 text-base font-semibold">{v.title}</h3>
              <p className="text-[13.5px] leading-relaxed text-muted-foreground">{v.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-gradient-to-br from-[#3B4680] to-primary px-7 py-6 text-primary-foreground">
          <div>
            <h3 className="text-lg font-semibold">มีคำถามเพิ่มเติม?</h3>
            <p className="text-sm text-primary-foreground/80">ติดต่อสอบถามข้อมูลกับทางโรงเรียนได้โดยตรง</p>
          </div>
          <Link
            href="/contact"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-card px-5 text-sm font-semibold text-primary transition-colors hover:bg-card/90"
          >
            ติดต่อเรา
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </>
  );
}
