import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function CtaSection() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 pb-14 pt-2 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(140deg,#333D6D,#242B4E)] px-6 py-10 text-white sm:px-14 sm:py-12">
        <div className="pointer-events-none absolute -top-20 right-[20%] size-64 rounded-full bg-[radial-gradient(circle,rgba(46,155,214,.35),transparent_70%)]" />
        <div className="relative flex flex-wrap items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="mb-3 text-2xl font-bold tracking-tight sm:text-[30px]">
              พร้อมเปิดรับนักเรียนใหม่ ปีการศึกษาใหม่
            </h2>
            <p className="text-base leading-relaxed text-white/80">
              ร่วมเป็นส่วนหนึ่งของครอบครัวไทยงาม ที่พร้อมพัฒนาลูกหลานของท่านให้เป็นคนดี เก่ง และมีความสุข
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admission"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-[15px] font-semibold text-primary transition-colors hover:bg-white/90"
            >
              สมัครเรียน
              <ArrowRight className="size-[18px]" aria-hidden="true" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center rounded-xl border border-white/25 bg-white/12 px-6 text-[15px] font-semibold text-white transition-colors hover:bg-white/20"
            >
              สอบถามข้อมูล
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
