#!/bin/sh
# สำรองฐานข้อมูล production → ~/thaingam-web/backups/db-YYYY-MM-DD-HHMM.sql.gz
#
# ใช้: ssh vps ~/thaingam-web/backup-db.sh
#
# ทำเป็นสคริปต์แทนคำสั่งบรรทัดเดียว เพราะ `$(date ...)` ที่ต้องรันบน VPS
# จะโดน PowerShell แอบคำนวณในเครื่องตัวเองก่อนส่ง (ดู spec.md ภาคผนวก)
set -e

# VPS ตั้งเป็น UTC → ชื่อไฟล์จะเป็นเวลา UTC อ่านแล้วงง ตั้งเป็นเวลาไทยให้ตรงกับที่คนใช้เข้าใจ
export TZ=Asia/Bangkok

cd "$(dirname "$0")"

KEEP=14 # เก็บย้อนหลังกี่ไฟล์
OUT="backups/db-$(date +%F-%H%M).sql.gz"

mkdir -p backups
docker compose exec -T db pg_dump -U "${POSTGRES_USER:-tguser}" "${POSTGRES_DB:-thaingamweb}" | gzip >"$OUT"

# pg_dump ล้มแล้ว gzip ยังสร้างไฟล์เปล่าได้ → เช็คขนาดจริงก่อนบอกว่าสำเร็จ
SIZE=$(wc -c <"$OUT")
if [ "$SIZE" -lt 1000 ]; then
	echo "❌ สำรองไม่สำเร็จ — ไฟล์เล็กผิดปกติ ($SIZE bytes) ลบทิ้งแล้ว" >&2
	rm -f "$OUT"
	exit 1
fi

# ลบไฟล์เก่าเกิน $KEEP อัน (เรียงตามชื่อ = เรียงตามเวลา)
ls -1t backups/db-*.sql.gz 2>/dev/null | tail -n "+$((KEEP + 1))" | xargs -r rm -f

echo "✅ สำรองแล้ว: $OUT ($(du -h "$OUT" | cut -f1))"
ls -lh backups/ | tail -5
