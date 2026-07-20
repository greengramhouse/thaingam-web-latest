"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { canManageSettings, getCurrentUser } from "@/lib/rbac";
import { ALL_SETTINGS, fieldName } from "@/lib/site-settings";
import { siteSettingsFormSchema } from "@/lib/validations/site-settings";
import type { ActionResult } from "@/server/actions/types";

/**
 * บันทึกตั้งค่าเว็บไซต์ทั้งชุด — upsert เฉพาะคีย์ที่ "มีค่า"
 * · ค่าว่าง → ลบคีย์นั้นทิ้ง (ไม่เก็บ row ว่างใน DB) เพื่อให้ Footer เช็ค "มีค่าไหม" ได้ตรง ๆ
 * · gate ด้วย canManageSettings (SUPER_ADMIN เท่านั้น)
 */
export async function updateSiteSettings(input: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user || !canManageSettings(user.role)) {
    return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };
  }

  const parsed = siteSettingsFormSchema.safeParse(input);
  if (!parsed.success) {
    // schema สร้างจาก index signature → flatten ให้ค่าเป็น string[] | undefined · cast ให้ตรง ActionResult
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>;
    return { ok: false, error: "ข้อมูลไม่ถูกต้อง", fieldErrors };
  }
  const values = parsed.data as Record<string, string | undefined>;

  // แยกเป็นชุดที่ต้อง upsert (มีค่า) กับชุดที่ต้องลบ (ว่าง) — วนตามนิยาม ไม่เชื่อคีย์แปลกจาก client
  const toUpsert: { key: string; value: string }[] = [];
  const toDelete: string[] = [];
  for (const def of ALL_SETTINGS) {
    const raw = values[fieldName(def.key)];
    const value = (raw ?? "").trim();
    if (value) toUpsert.push({ key: def.key, value });
    else toDelete.push(def.key);
  }

  try {
    await prisma.$transaction([
      ...toUpsert.map((s) =>
        prisma.siteSetting.upsert({
          where: { key: s.key },
          update: { value: s.value },
          create: { key: s.key, value: s.value },
        }),
      ),
      prisma.siteSetting.deleteMany({ where: { key: { in: toDelete } } }),
    ]);

    revalidatePath("/admin/settings");
    revalidatePath("/", "layout"); // Footer อยู่ใน layout สาธารณะ (Phase 4.5)
    return { ok: true, id: user.id };
  } catch (error) {
    console.error("updateSiteSettings failed:", error);
    return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
}
