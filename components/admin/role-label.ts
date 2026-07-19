/** ชื่อ role ภาษาไทยสำหรับแสดงผล — ใช้ร่วมกันทั้ง topbar และ dashboard */
const labels: Record<string, string> = {
  SUPER_ADMIN: "ผู้ดูแลระบบสูงสุด",
  ADMIN: "ผู้ดูแลระบบ",
  TEACHER: "ครู",
};

export function roleLabel(role?: string | null) {
  return (role && labels[role]) || "ไม่ระบุสิทธิ์";
}

/** ชื่อ role แบบสั้น สำหรับ pill ที่พื้นที่จำกัด (เช่น รายชื่อผู้ใช้ในแดชบอร์ด) */
const shortLabels: Record<string, string> = {
  SUPER_ADMIN: "แอดมินสูงสุด",
  ADMIN: "แอดมิน",
  TEACHER: "ครู",
};

export function roleLabelShort(role?: string | null) {
  return (role && shortLabels[role]) || "ไม่ระบุ";
}
