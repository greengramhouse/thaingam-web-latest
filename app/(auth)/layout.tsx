import { School, ShieldCheck } from "lucide-react";

const AUTH_FONT = "var(--font-inter), var(--font-anuphan), sans-serif";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen"
      style={{ fontFamily: AUTH_FONT, background: "#F7F8FB", color: "#1C2135" }}
    >
      {/* ===== แผงแบรนด์ (ซ้าย) — ซ่อนบนจอเล็ก ===== */}
      <div
        className="relative hidden flex-1 overflow-hidden text-white lg:flex"
        style={{
          background:
            "linear-gradient(160deg,#3B4680 0%,#333D6D 45%,#242B4E 100%)",
        }}
      >
        {/* วงกลมเรืองแสงตกแต่ง */}
        <div
          className="pointer-events-none absolute -right-[100px] -top-[120px] h-[360px] w-[360px] rounded-full"
          style={{
            background:
              "radial-gradient(circle,rgba(46,155,214,.35),transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute -bottom-[140px] -left-[80px] h-[380px] w-[380px] rounded-full"
          style={{
            background:
              "radial-gradient(circle,rgba(47,191,160,.22),transparent 70%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,.06) 1px,transparent 1px)",
            backgroundSize: "26px 26px",
          }}
        />

        <div className="relative flex h-full w-full flex-col justify-between p-14 pb-11">
          {/* โลโก้ + ชื่อโรงเรียน */}
          <div className="flex items-center gap-3.5">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white"
              style={{ boxShadow: "0 8px 24px rgba(0,0,0,.18)" }}
            >
              <School className="h-[26px] w-[26px]" style={{ color: "#333D6D" }} />
            </div>
            <div className="leading-[1.25]">
              <div className="text-[17px] font-semibold">
                โรงเรียนชุมชนวัดไทยงาม
              </div>
              <div className="text-[12.5px] tracking-[.04em] text-white/70">
                THAINGAM COMMUNITY SCHOOL
              </div>
            </div>
          </div>

          {/* ข้อความต้อนรับ */}
          <div className="max-w-[420px]">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[13px] font-medium">
              <ShieldCheck className="h-4 w-4" />
              ระบบจัดการข้อมูลโรงเรียน
            </div>
            <h1 className="mb-4 text-[40px] font-bold leading-[1.15] tracking-[-.01em]">
              ยินดีต้อนรับ
              <br />
              เข้าสู่ระบบหลังบ้าน
            </h1>
            <p className="mb-7 text-base leading-[1.7] text-white/[.78]">
              จัดการข่าวสาร ผลงาน สื่อการสอน ปฏิทินกิจกรรม
              และข้อมูลโรงเรียนได้จากที่เดียว อย่างปลอดภัย
            </p>
            <div className="flex flex-wrap gap-2.5">
              {["ดี", "เก่ง", "มีสุข"].map((word) => (
                <span
                  key={word}
                  className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          <div className="text-[12.5px] text-white/60">
            © 2568 โรงเรียนชุมชนวัดไทยงาม · สงวนลิขสิทธิ์
          </div>
        </div>
      </div>

      {/* ===== แผงฟอร์ม (ขวา) ===== */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        <div className="w-full max-w-[400px]">
          {/* โลโก้สำหรับจอเล็ก (แผงแบรนด์ถูกซ่อน) */}
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{ background: "#EEF0F6" }}
            >
              <School className="h-6 w-6" style={{ color: "#333D6D" }} />
            </div>
            <div className="text-[15px] font-semibold" style={{ color: "#333D6D" }}>
              โรงเรียนชุมชนวัดไทยงาม
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
