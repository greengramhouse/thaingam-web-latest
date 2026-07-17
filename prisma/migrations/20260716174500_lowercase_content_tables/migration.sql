-- เปลี่ยนชื่อตารางให้เป็นตัวพิมพ์เล็กเหมือนตาราง auth (user/session/news) — ใช้ RENAME ไม่ใช่ drop+create
-- เพื่อรักษาข้อมูลเดิม (หมวดหมู่ที่ seed ไว้) และ FK/index ย้ายตามตารางไปเอง
ALTER TABLE "Category" RENAME TO "category";
ALTER TABLE "Tag" RENAME TO "tag";
