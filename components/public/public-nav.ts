/** เมนูหลักเว็บสาธารณะ — แหล่งความจริงเดียวของ Navbar (desktop + mobile drawer) */
export type PublicNavItem = { href: string; label: string };

/** เมนูหลัก desktop (ตาม design — กระชับ) */
export const publicNav: PublicNavItem[] = [
  { href: "/", label: "หน้าแรก" },
  { href: "/news", label: "ข่าวสาร" },
  { href: "/works", label: "ผลงาน / สื่อ" },
  { href: "/calendar", label: "ปฏิทิน" },
  { href: "/staff", label: "บุคลากร" },
  { href: "/about", label: "เกี่ยวกับ" },
];

/** เมนูเพิ่มเติมสำหรับ drawer มือถือ (หน้าอื่นที่ไม่อยู่ในแถบหลัก) */
export const publicNavExtra: PublicNavItem[] = [
  { href: "/albums", label: "อัลบั้มภาพ" },
  { href: "/documents", label: "เอกสารดาวน์โหลด" },
  { href: "/admission", label: "การรับสมัคร" },
  { href: "/contact", label: "ติดต่อเรา" },
];
