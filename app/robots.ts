import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site-url";

/**
 * `/robots.txt` — บอก crawler ว่าเข้าตรงไหนได้
 * หลังบ้าน/หน้าล็อกอิน/API กันไว้ (หน้า admin มี `robots: noindex` ใน layout อยู่แล้ว — นี่คือชั้นที่สอง)
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/api", "/login"],
    },
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
