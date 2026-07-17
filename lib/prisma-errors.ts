import { Prisma } from "@/lib/generated/prisma/client";

/**
 * เช็คว่า error คือ unique constraint ชนที่ field ที่ระบุหรือไม่
 *
 * ⚠️ Prisma 7 + driver adapter (@prisma/adapter-pg) **ไม่ใส่ `meta.target`** แบบที่ Prisma รุ่นก่อนทำ
 *    แต่เก็บฟิลด์ที่ชนไว้ที่ `meta.driverAdapterError.cause.constraint.fields` แทน
 *    เลยต้องอ่านทั้งสองที่ ไม่งั้น slug ซ้ำจะตกไปเป็น error กว้าง ๆ แทนที่จะขึ้นตรงช่องนั้น
 */
export function isUniqueError(error: unknown, field: string) {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
    return false;
  }

  const meta = error.meta as
    | {
        target?: string[];
        driverAdapterError?: { cause?: { constraint?: { fields?: string[] } } };
      }
    | undefined;

  const fields = meta?.target ?? meta?.driverAdapterError?.cause?.constraint?.fields;
  return fields?.includes(field) ?? false;
}

/** ทางลัดของเคสที่เจอบ่อยสุด — slug ซ้ำ */
export function isUniqueSlugError(error: unknown) {
  return isUniqueError(error, "slug");
}
