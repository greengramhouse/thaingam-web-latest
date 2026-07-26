-- CreateTable
CREATE TABLE "staff_department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_department_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "staff_department_name_key" ON "staff_department"("name");

-- CreateIndex
CREATE INDEX "staff_department_order_idx" ON "staff_department"("order");

-- CreateIndex
CREATE INDEX "staff_department_idx" ON "staff"("department");

-- เก็บกวาดข้อมูลเดิม: ฝ่ายที่เป็นช่องว่างล้วนต้องเป็น NULL
-- โค้ดใหม่ normalize ให้แล้วตอนบันทึก แต่แถวเก่ายังค้าง และ `where: { department: null }`
-- ตอนเลื่อนลำดับจะมองไม่เห็นแถวที่เป็น '' → กลายเป็นกลุ่มผีที่ขยับไม่ได้
UPDATE "staff" SET "department" = NULL WHERE btrim("department") = '';

-- เติมกลุ่มจากฝ่ายที่มีอยู่แล้วในทำเนียบ
-- ลำดับเริ่มต้นยึดตามที่หน้าเว็บเคยแสดง (กลุ่มเรียงตาม order ต่ำสุดของสมาชิก) — แอดมินเปิดมาจะได้
-- เห็นเหมือนเดิมก่อน แล้วค่อยจัดใหม่ด้วยปุ่ม ▲▼
INSERT INTO "staff_department" ("id", "name", "order")
SELECT
    gen_random_uuid()::text,
    d."department",
    (row_number() OVER (ORDER BY d."min_order", d."department"))::int - 1
FROM (
    SELECT "department", MIN("order") AS "min_order"
    FROM "staff"
    WHERE "department" IS NOT NULL
    GROUP BY "department"
) d;
