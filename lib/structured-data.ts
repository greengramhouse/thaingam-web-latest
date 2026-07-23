import "server-only";
import { absoluteUrl, siteUrl } from "@/lib/site-url";
import { getSiteSettings } from "@/lib/site-settings-data";
import { DEFAULT_OG_IMAGE } from "@/lib/metadata";

/**
 * ข้อมูล schema.org ของโรงเรียน — ใช้ที่หน้าแรก/หน้าเกี่ยวกับ และเป็น `publisher` ของบทความ
 * ดึงค่าจริงจาก SiteSetting (ที่อยู่/เบอร์/อีเมล/social) — ไม่มีค่าไหนก็ตัดคีย์นั้นทิ้ง ไม่ใส่ค่าปลอม
 */
export async function schoolJsonLd(): Promise<Record<string, unknown>> {
  const settings = await getSiteSettings();
  const socials = ["social.facebook", "social.youtube", "social.line", "social.tiktok"]
    .map((k) => settings[k])
    .filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "School",
    "@id": `${siteUrl()}#school`,
    name: settings["site.name"] || "โรงเรียนชุมชนวัดไทยงาม",
    ...(settings["site.nameEn"] ? { alternateName: settings["site.nameEn"] } : {}),
    ...(settings["site.tagline"] ? { slogan: settings["site.tagline"] } : {}),
    url: siteUrl(),
    logo: absoluteUrl("/logo.png"),
    image: absoluteUrl(DEFAULT_OG_IMAGE.url),
    ...(settings["contact.phone"] ? { telephone: settings["contact.phone"] } : {}),
    ...(settings["contact.email"] ? { email: settings["contact.email"] } : {}),
    ...(settings["contact.address"]
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress: settings["contact.address"],
            addressCountry: "TH",
          },
        }
      : {}),
    ...(socials.length ? { sameAs: socials } : {}),
  };
}

/** บทความ (ข่าว / ผลงานชนิดบทความ) — ผูก publisher กลับไปที่โรงเรียน */
export async function articleJsonLd(article: {
  path: string;
  title: string;
  description?: string | null;
  image?: string | null;
  publishedAt?: Date | null;
  updatedAt?: Date | null;
  authorName?: string | null;
}): Promise<Record<string, unknown>> {
  const settings = await getSiteSettings();
  const schoolName = settings["site.name"] || "โรงเรียนชุมชนวัดไทยงาม";

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    ...(article.description ? { description: article.description } : {}),
    // รูปปกจริงถ้ามี ไม่มีก็ใช้รูป OG ของเว็บ (1200×630 — สัดส่วนที่ Google/โซเชียลชอบ)
    image: [article.image || absoluteUrl(DEFAULT_OG_IMAGE.url)],
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(article.path) },
    ...(article.publishedAt ? { datePublished: article.publishedAt.toISOString() } : {}),
    ...(article.updatedAt ? { dateModified: article.updatedAt.toISOString() } : {}),
    author: { "@type": article.authorName ? "Person" : "Organization", name: article.authorName || schoolName },
    publisher: {
      "@type": "Organization",
      name: schoolName,
      logo: { "@type": "ImageObject", url: absoluteUrl("/logo.png") },
    },
  };
}
