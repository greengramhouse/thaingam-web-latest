import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getSiteSettings, mapEmbedSrc } from "@/lib/site-settings-data";
import { ContactForm } from "@/components/public/contact-form";

export const metadata: Metadata = {
  title: "ติดต่อเรา",
  description: "ช่องทางติดต่อโรงเรียนชุมชนวัดไทยงาม — ที่อยู่ โทรศัพท์ อีเมล และแบบฟอร์มติดต่อ",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const address = settings["contact.address"];
  const phone = settings["contact.phone"];
  const email = settings["contact.email"];
  const hours = settings["contact.hours"];
  const mapSrc = mapEmbedSrc(settings["map.embed"]);

  const infoCards = [
    address && { icon: MapPin, label: "ที่อยู่", value: address, tint: "bg-secondary text-primary" },
    phone && { icon: Phone, label: "โทรศัพท์", value: phone, href: `tel:${phone}`, tint: "bg-mint-muted text-mint-foreground" },
    email && { icon: Mail, label: "อีเมล", value: email, href: `mailto:${email}`, tint: "bg-sky-muted text-sky-foreground" },
    hours && { icon: Clock, label: "เวลาทำการ", value: hours, tint: "bg-secondary text-primary" },
  ].filter(Boolean) as {
    icon: typeof MapPin;
    label: string;
    value: string;
    href?: string;
    tint: string;
  }[];

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-9 pb-16 sm:px-6">
      <div className="mb-7">
        <h1 className="text-[26px] font-bold tracking-tight sm:text-[30px]">ติดต่อเรา</h1>
        <p className="mt-1.5 text-[15px] text-muted-foreground">
          มีข้อสงสัยหรือต้องการสอบถามข้อมูล ติดต่อเราได้ตามช่องทางด้านล่าง
        </p>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.1fr]">
        {/* ซ้าย: ข้อมูลติดต่อ + แผนที่ */}
        <div>
          <div className="flex flex-col gap-3.5">
            {infoCards.length === 0 ? (
              <p className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
                ยังไม่ได้ตั้งค่าข้อมูลติดต่อ
              </p>
            ) : (
              infoCards.map((c) => {
                const inner = (
                  <div className="flex items-start gap-3.5 rounded-2xl border border-border bg-card p-[18px] shadow-sm">
                    <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${c.tint}`}>
                      <c.icon className="size-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{c.label}</div>
                      <div className="text-[13.5px] leading-relaxed text-muted-foreground">{c.value}</div>
                    </div>
                  </div>
                );
                return c.href ? (
                  <a key={c.label} href={c.href} className="block transition-colors hover:[&>div]:border-primary/40">
                    {inner}
                  </a>
                ) : (
                  <div key={c.label}>{inner}</div>
                );
              })
            )}
          </div>

          {mapSrc && (
            <div className="mt-5 aspect-[16/10] overflow-hidden rounded-2xl border border-border">
              <iframe
                src={mapSrc}
                title="แผนที่โรงเรียน"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
                className="size-full"
              />
            </div>
          )}
        </div>

        {/* ขวา: ฟอร์ม */}
        <ContactForm />
      </div>
    </div>
  );
}
