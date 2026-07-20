import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

/**
 * Access-control statements ของโปรเจกต์
 * เริ่มจาก defaultStatements ของ admin plugin (จัดการ user/session)
 * เพิ่ม resource ของเนื้อหา (news/media/...) ภายหลังตอนทำ CRUD แต่ละส่วน (just-in-time)
 */
const statement = {
  ...defaultStatements,
} as const;

export const ac = createAccessControl(statement);

// TEACHER — ยังไม่มีสิทธิ์อะไรเลย (ไม่จัดการเนื้อหา ไม่จัดการ user)
// สงวน role ไว้ให้ส่วน "ข้อมูลภายในโรงเรียน" (ข้อมูลนักเรียน/ผลการเรียน) ที่จะทำภายหลัง — spec §3
export const TEACHER = ac.newRole({});

// ADMIN — จัดการ "เนื้อหา" ทั้งหมด + publish (ผ่าน canManageContent ไม่ใช่ admin plugin)
// ❌ ไม่ให้สิทธิ์ admin plugin (จัดการ user/session) — Users เป็นของ SUPER_ADMIN เท่านั้น (spec §3)
//    ถ้าให้ adminAc.statements ที่นี่ ADMIN จะยิง set-role/ban/create-user ตรงได้ (privilege escalation)
export const ADMIN = ac.newRole({});

// SUPER_ADMIN — เต็มสิทธิ์ (รวมจัดการ user/session ของ admin plugin)
export const SUPER_ADMIN = ac.newRole({
  ...adminAc.statements,
});

export const roles = { SUPER_ADMIN, ADMIN, TEACHER };
