import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { ac, roles } from "@/lib/permissions";

export const authClient = createAuthClient({
  // ส่ง ac + roles ให้ client รู้จัก role ที่โปรเจกต์นิยาม (SUPER_ADMIN/ADMIN/TEACHER)
  // ไม่งั้น type ของ admin.createUser/setRole จะเป็น "user"|"admin" ตาม default ของ Better Auth
  plugins: [adminClient({ ac, roles })],
});

export const { signIn, signOut, signUp, useSession } = authClient;
