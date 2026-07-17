/** ชื่อ role ภาษาไทยสำหรับแสดงผล — ใช้ร่วมกันทั้ง topbar และ dashboard */
const labels: Record<string, string> = {
  SUPER_ADMIN: "ผู้ดูแลระบบสูงสุด",
  ADMIN: "ผู้ดูแลระบบ",
  TEACHER: "ครู",
};

export function roleLabel(role?: string | null) {
  return (role && labels[role]) || "ไม่ระบุสิทธิ์";
}
