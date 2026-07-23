"use client";

/**
 * ตาข่ายชั้นสุดท้าย — ใช้เฉพาะตอน **root layout เองพัง** (error.tsx ชั้นในไม่ทำงานแล้ว)
 *
 * ⚠️ ต้องเรนเดอร์ `<html>`/`<body>` เอง เพราะมันแทนที่ layout ทั้งหมด
 * และ **ห้ามพึ่ง Tailwind/ฟอนต์** — CSS ถูก import ใน root layout ที่พังไปแล้ว → ใช้ inline style ล้วน
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="th">
      <body
        style={{
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          padding: 24,
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          color: "#1F2340",
          background: "#F6F7FB",
        }}
      >
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>ระบบขัดข้อง</h1>
        <p style={{ margin: 0, color: "#5B6079", lineHeight: 1.7 }}>
          เว็บไซต์ทำงานผิดพลาดชั่วคราว กรุณาลองโหลดใหม่อีกครั้ง
        </p>
        {error.digest && (
          <p style={{ margin: 0, fontSize: 12, color: "#8A8FA6" }}>รหัสอ้างอิง: {error.digest}</p>
        )}
        <button
          onClick={reset}
          style={{
            marginTop: 12,
            padding: "10px 22px",
            borderRadius: 10,
            border: "none",
            background: "#333D6D",
            color: "#fff",
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ลองใหม่อีกครั้ง
        </button>
      </body>
    </html>
  );
}
