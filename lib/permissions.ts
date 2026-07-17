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

// ADMIN — จัดการเนื้อหาทั้งหมด + publish + จัดการ user (สิทธิ์ admin plugin)
export const ADMIN = ac.newRole({
  ...adminAc.statements,
});

// SUPER_ADMIN — เต็มสิทธิ์
export const SUPER_ADMIN = ac.newRole({
  ...adminAc.statements,
});

export const roles = { SUPER_ADMIN, ADMIN, TEACHER };
