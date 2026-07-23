import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * `standalone` = build ออกมาเป็นโฟลเดอร์ที่รันเองได้ (`.next/standalone/server.js`)
   * พร้อม node_modules เฉพาะที่ใช้จริง → image Docker เล็กลงมาก และไม่ต้องลง dev deps บนเซิร์ฟเวอร์
   */
  output: "standalone",
};

export default nextConfig;
