"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { canManageContent, getCurrentUser } from "@/lib/rbac";
import { documentFormSchema } from "@/lib/validations/document";
import type { ActionResult } from "@/server/actions/types";

async function requireContentManager() {
  const user = await getCurrentUser();
  if (!user || !canManageContent(user.role)) return null;
  return user;
}

function revalidateDocuments() {
  revalidatePath("/admin/documents");
  revalidatePath("/documents"); // ศูนย์ดาวน์โหลดสาธารณะ (Phase 4.6)
}

type Parsed = ReturnType<typeof documentFormSchema.parse>;

/** แปลง field ของฟอร์ม (string + ค่าว่าง + boolean published) → รูปที่บันทึกลง DB */
function toDocumentData(data: Parsed) {
  return {
    title: data.title,
    description: data.description || null,
    fileUrl: data.fileUrl,
    fileType: data.fileType || null,
    category: data.category?.trim() || null,
    status: data.published ? ("PUBLISHED" as const) : ("DRAFT" as const),
  };
}

export async function createDocument(input: unknown): Promise<ActionResult> {
  const user = await requireContentManager();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const parsed = documentFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  try {
    const doc = await prisma.document.create({ data: toDocumentData(parsed.data), select: { id: true } });
    revalidateDocuments();
    return { ok: true, id: doc.id };
  } catch (error) {
    console.error("createDocument failed:", error);
    return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function updateDocument(id: string, input: unknown): Promise<ActionResult> {
  const user = await requireContentManager();
  if (!user) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const parsed = documentFormSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "ข้อมูลไม่ถูกต้อง", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.document.findUnique({ where: { id }, select: { id: true } });
  if (!existing) return { ok: false, error: "ไม่พบเอกสารนี้" };

  try {
    const doc = await prisma.document.update({
      where: { id },
      data: toDocumentData(parsed.data),
      select: { id: true },
    });
    revalidateDocuments();
    return { ok: true, id: doc.id };
  } catch (error) {
    console.error("updateDocument failed:", error);
    return { ok: false, error: "บันทึกไม่สำเร็จ กรุณาลองใหม่" };
  }
}

export async function deleteDocument(id: string): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  try {
    const doc = await prisma.document.delete({ where: { id }, select: { id: true } });
    revalidateDocuments();
    return { ok: true, id: doc.id };
  } catch (error) {
    console.error("deleteDocument failed:", error);
    return { ok: false, error: "ลบไม่สำเร็จ กรุณาลองใหม่" };
  }
}

/** สลับเผยแพร่/ร่าง (แสดง/ซ่อนในศูนย์ดาวน์โหลด) */
export async function toggleDocumentPublish(id: string): Promise<ActionResult> {
  if (!(await requireContentManager())) return { ok: false, error: "ไม่มีสิทธิ์ทำรายการนี้" };

  const existing = await prisma.document.findUnique({ where: { id }, select: { status: true } });
  if (!existing) return { ok: false, error: "ไม่พบเอกสารนี้" };

  try {
    const doc = await prisma.document.update({
      where: { id },
      data: { status: existing.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED" },
      select: { id: true },
    });
    revalidateDocuments();
    return { ok: true, id: doc.id };
  } catch (error) {
    console.error("toggleDocumentPublish failed:", error);
    return { ok: false, error: "เปลี่ยนสถานะไม่สำเร็จ กรุณาลองใหม่" };
  }
}
