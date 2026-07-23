#!/bin/sh
# รัน migration ให้ DB ตรงกับโค้ดก่อนเปิดรับ traffic แล้วค่อย start เซิร์ฟเวอร์
#
# ⚠️ `migrate deploy` ใช้เฉพาะ migration ที่ commit ไว้ ไม่สร้างใหม่/ไม่ถามอะไร (ปลอดภัยกับ prod)
# ⚠️ ไม่ generate client ให้ — client ถูก generate ตอน build ไปแล้ว (problems.md 3.1)
# ⚠️ prisma CLI อยู่ที่ /opt/tools ไม่ใช่ node_modules ของแอป (ดูเหตุผลใน Dockerfile stage `prisma-cli`)
#
# ℹ️ **ไม่มีขั้น seed ที่นี่** — `prisma/seed.ts` import `@/lib/auth` ซึ่งเป็น source ที่ไม่ได้อยู่ใน
#    image (standalone มีแต่โค้ดที่ build แล้ว) → seed ครั้งแรกทำจากเครื่องผู้ดูแลผ่าน SSH tunnel
#    ดูขั้นตอนใน docs/deploy.md
set -e

PRISMA=/opt/tools/node_modules/.bin/prisma

# ⚠️ `prisma.config.ts` ของโปรเจกต์ `import "dotenv/config"` แต่ node_modules ของ standalone
#    มีเฉพาะที่แอปใช้จริง (ไม่มี dotenv) → ต้องชี้ NODE_PATH ไปที่ชุดเครื่องมือ ไม่งั้น
#    "Cannot find module 'dotenv/config'" (เจอมาแล้วตอนทดสอบ image)
export NODE_PATH=/opt/tools/node_modules

echo "▶ prisma migrate deploy"
"$PRISMA" migrate deploy

echo "▶ starting Next.js"
exec "$@"
