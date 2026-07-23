import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getSiteSettings } from "@/lib/site-settings-data";
import { OG_SIZE } from "@/lib/metadata";

/**
 * รูป OG เริ่มต้นของเว็บ — แชร์ลิงก์ใน Facebook/LINE/X แล้วขึ้นการ์ดภาพ
 *
 * ⚠️ **ทำไมเป็น route (`/og.png`) ไม่ใช่ไฟล์ `opengraph-image.tsx`:**
 * Next merge metadata แบบ **shallow** — หน้าไหนประกาศ `openGraph` เอง จะทับของ layout ทั้งก้อน
 * รวมถึงรูปจาก file convention ที่หายไปด้วย (เจอจริงตอน verify: หน้าผลงานที่ไม่มีรูปปก → ไม่มี `og:image` เลย)
 * และ path ของ file convention มี hash ต่อท้าย (`/opengraph-image-1c1a04?…`) จะอ้างอิงตรง ๆ ก็ไม่ได้
 * → ทำเป็น URL คงที่ แล้วให้ทุกหน้าอ้างผ่าน `lib/metadata.ts` แทน
 *
 * ⚠️ ต้องโหลดฟอนต์ไทยเอง — ฟอนต์เริ่มต้นของ ImageResponse (Geist) ไม่มีตัวอักษรไทย จะได้กล่องสี่เหลี่ยม
 * เก็บ TTF ไว้ที่ `assets/` (นอก `public/` เพราะไม่ต้อง serve ให้เบราว์เซอร์)
 */

// รูปเปลี่ยนเฉพาะตอนแอดมินแก้ชื่อ/คำขวัญ → cache 1 ชม. พอ (ไม่ต้อง render ใหม่ทุกครั้งที่มีคนแชร์)
export const revalidate = 3600;

/**
 * อ่านตั้งค่าเว็บแบบ "พังได้" — route นี้ถูก prerender ตอน build ซึ่ง **CI ไม่มี DB**
 * (ดู problems.md 8.6) → ต่อ DB ไม่ได้ให้ใช้ค่าเริ่มต้นไปก่อน แล้วรอบ revalidate ถัดไปค่อยได้ค่าจริง
 * ดีกว่าปล่อยให้ทั้ง build ล้มเพราะรูปแชร์รูปเดียว
 */
async function settingsOrDefaults(): Promise<Record<string, string>> {
  try {
    return await getSiteSettings();
  } catch {
    return {};
  }
}

export async function GET() {
  const [font, logo, settings] = await Promise.all([
    readFile(join(process.cwd(), "assets/Anuphan-SemiBold.ttf")),
    readFile(join(process.cwd(), "public/logo.png"), "base64"),
    settingsOrDefaults(),
  ]);

  const siteName = settings["site.name"] || "โรงเรียนชุมชนวัดไทยงาม";
  const siteNameEn = settings["site.nameEn"] || "THAINGAM COMMUNITY SCHOOL";
  const tagline = settings["site.tagline"] || "ข่าวสาร · ผลงาน · กิจกรรมของโรงเรียน";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 56,
          padding: "0 88px",
          // ไล่เฉดครามเดียวกับ PageHero (#3B4680 → #333D6D)
          backgroundImage: "linear-gradient(135deg, #3B4680 0%, #333D6D 100%)",
          color: "#FFFFFF",
          fontFamily: "Anuphan",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse เรนเดอร์ด้วย satori ไม่ใช่ DOM จริง ใช้ next/image ไม่ได้ */}
        <img
          src={`data:image/png;base64,${logo}`}
          width={236}
          height={236}
          alt=""
          style={{ objectFit: "contain" }}
        />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 62, lineHeight: 1.15, letterSpacing: -1 }}>{siteName}</div>
          <div style={{ fontSize: 26, letterSpacing: 2, opacity: 0.75, marginTop: 14 }}>
            {siteNameEn}
          </div>
          <div
            style={{
              marginTop: 30,
              paddingTop: 26,
              borderTop: "2px solid rgba(255,255,255,0.28)",
              fontSize: 30,
              opacity: 0.9,
            }}
          >
            {tagline}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [{ name: "Anuphan", data: font, style: "normal", weight: 600 }],
    },
  );
}
