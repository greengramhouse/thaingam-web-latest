# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Thaingam-web — multi-stage build (deps → builder → runner)
#
# ⚠️ NEXT_PUBLIC_* ถูก "ฝัง" ตอน build ไม่ใช่ตอนรัน → ต้องส่งเป็น build arg
#    ไม่งั้น client ได้ค่าว่าง (อัปโหลดรูป Cloudinary พัง, sitemap/OG ชี้ localhost)
# ✅ Prisma 7 ที่นี่ใช้ query compiler แบบ WASM + driver adapter `pg` (pure JS)
#    → ไม่มี engine binary ให้ copy และไม่ต้องห่วง openssl/musl บน Alpine
# ✅ หน้า public ทั้งหมดเป็น force-dynamic แล้ว → `next build` **ไม่ต้องต่อ DB**
#    (ดู docs/problems.md 8.6 — เคย build พังบน CI เพราะข้อนี้)
# ---------------------------------------------------------------------------
FROM node:22-alpine AS base
RUN corepack enable
WORKDIR /app

# ---- deps: ลง dependency ตาม lockfile อย่างเดียว (cache layer นี้ไว้ได้นาน) ----
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
COPY prisma.config.ts ./
# `postinstall` ของโปรเจกต์นี้รัน `prisma generate` ให้เอง (จึงต้อง copy schema มาก่อน)
RUN pnpm install --frozen-lockfile

# ---- builder: next build ----
FROM base AS builder
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
ARG NEXT_PUBLIC_CLOUDINARY_API_KEY
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=$NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME \
    NEXT_PUBLIC_CLOUDINARY_API_KEY=$NEXT_PUBLIC_CLOUDINARY_API_KEY \
    NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# ⚠️ **ต้องอยู่หลัง `COPY . .`** — Prisma client ที่ generate แล้วออกที่ `lib/generated/prisma`
#    ซึ่งอยู่ **นอก** node_modules และถูก .gitignore ไว้
#    → บนเครื่องนักพัฒนามีไฟล์นี้อยู่ `COPY . .` เลยลากติดมาด้วย build ผ่าน
#      แต่บน CI (checkout สะอาด) ไม่มี → `@/lib/generated/prisma/client` หาย build ล้มทันที
#    หยิบจาก stage deps ที่ postinstall generate ไว้แล้ว (ไม่ต้อง generate ซ้ำ)
COPY --from=deps /app/lib/generated ./lib/generated
RUN pnpm build

# ---- prisma-cli: เครื่องมือสำหรับ migrate/seed ตอน deploy ----
# ⚠️ **ห้าม copy `node_modules/prisma` จาก builder ตรง ๆ** — pnpm วางของจริงไว้ใน `.pnpm/`
#    แล้ว symlink มา → copy มาแล้วรันไม่ได้ `MODULE_NOT_FOUND` (พิสูจน์มาแล้วตอนทดสอบ image)
#    → ลงใหม่ในโฟลเดอร์แยกให้ครบทั้ง dependency แล้วค่อย copy ทั้งก้อน
# อ่านเวอร์ชันที่ **ติดตั้งจริง** จาก stage deps (ไม่ใช่ช่วง `^7.x` ใน package.json)
# → CLI ตรงกับ client เป๊ะ ไม่เสี่ยง migrate ด้วยคนละรุ่น
FROM deps AS prisma-cli
RUN mkdir -p /opt/tools \
    && PV=$(node -p "require('/app/node_modules/prisma/package.json').version") \
    && TSXV=$(node -p "require('/app/node_modules/tsx/package.json').version") \
    && cd /opt/tools \
    # เขียน package.json เองแทน `pnpm init` — pnpm รุ่นนี้ใส่ `devEngines.packageManager: ^11.x`
    # ซึ่ง corepack ปฏิเสธ ("expected a semver version") ทำให้ build ล้ม
    && echo '{"name":"thaingam-tools","version":"1.0.0","private":true}' > package.json \
    # ต้องอนุญาต build script เหมือน pnpm-workspace.yaml ของโปรเจกต์
    # ไม่งั้น pnpm หยุดด้วย ERR_PNPM_IGNORED_BUILDS (prisma/esbuild ต้องรัน postinstall)
    && printf 'allowBuilds:\n  "@prisma/engines": true\n  esbuild: true\n  prisma: true\n' > pnpm-workspace.yaml \
    && pnpm add "prisma@$PV" "tsx@$TSXV" dotenv

# ---- runner: image สุดท้าย ----
FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -g 1001 -S nodejs && adduser -u 1001 -S nextjs -G nodejs

# ผลลัพธ์ standalone (มี node_modules เท่าที่ใช้จริงอยู่ข้างใน)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# ฟอนต์ไทยของรูป OG — อยู่นอก public/ จึงไม่ถูก copy มากับชุดข้างบน
COPY --from=builder --chown=nextjs:nodejs /app/assets ./assets

# ต้องมีตอน migrate/seed (แยกจาก bundle ของแอป): prisma CLI + schema + ไฟล์ migration
COPY --from=prisma-cli --chown=nextjs:nodejs /opt/tools /opt/tools
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
# tsconfig ต้องมีด้วย — seed ใช้ path alias `@/lib/...` ซึ่ง tsx อ่านจากไฟล์นี้
COPY --from=builder --chown=nextjs:nodejs /app/tsconfig.json ./tsconfig.json

COPY --chown=nextjs:nodejs docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

USER nextjs
EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
