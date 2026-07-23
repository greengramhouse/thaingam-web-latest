# 🚀 Deploy — Thaingam-web (Docker + GitHub Actions บน VPS)

> ขั้นตอนจริงที่ต้องทำ เรียงตามลำดับ · สถาปัตยกรรมและเหตุผลอยู่ใน [`roadmap.md`](./roadmap.md) §4.8
> กับดักที่เจอระหว่างทำอยู่ใน [`problems.md`](./problems.md) 8.6 / 9.x

## ภาพรวม

```
push main → GitHub Actions: docker build → push GHCR
                                   ↓
                        ssh เข้า VPS → compose pull && up -d
                                   ↓
        entrypoint: prisma migrate deploy → start Next (standalone)
```

บน VPS มี 2–3 container: `app` (Next :3000) · `db` (Postgres + volume) · `caddy` (ถ้าเครื่องยังไม่มี reverse proxy)

## ไฟล์ที่เกี่ยวข้อง

| ไฟล์ | หน้าที่ |
|---|---|
| `Dockerfile` | build 4 stage: `deps` → `builder` → `prisma-cli` → `runner` |
| `docker-entrypoint.sh` | `prisma migrate deploy` แล้วค่อย start |
| `docker-compose.yml` | app + db (+ volume, healthcheck) |
| `docker-compose.caddy.yml` | ชั้น proxy **ใช้เฉพาะเมื่อเครื่องยังไม่มี nginx/caddy** |
| `Caddyfile` | reverse proxy + HTTPS อัตโนมัติ + security header |
| `.github/workflows/deploy.yml` | CI/CD |
| `.env.production.example` | แม่แบบ `.env` ที่ต้องวางบน VPS |

---

## 1) เตรียม VPS

```bash
# ติดตั้ง docker + compose plugin (ถ้ายังไม่มี)
curl -fsSL https://get.docker.com | sh

# โฟลเดอร์ของโปรเจกต์
sudo mkdir -p /srv/thaingam-web && cd /srv/thaingam-web
```

คัดลอกขึ้นเครื่อง: `docker-compose.yml` · `.env` (สร้างจาก `.env.production.example`) ·
`Caddyfile` + `docker-compose.caddy.yml` (เฉพาะถ้าจะใช้ Caddy)

**ตรวจก่อนว่ามี reverse proxy อยู่แล้วหรือยัง:**

```bash
sudo ss -tlnp '( sport = :80 or sport = :443 )'
which nginx caddy 2>/dev/null; systemctl is-active nginx caddy 2>/dev/null
docker ps --format '{{.Names}}\t{{.Image}}\t{{.Ports}}'
```

- **ไม่มีอะไรฟัง 80/443** → ใช้ Caddy ของเรา (`-f docker-compose.yml -f docker-compose.caddy.yml`)
- **มี nginx/caddy อยู่แล้ว** → **อย่า** ใช้ไฟล์ caddy ของเรา (พอร์ตชนกัน) ให้ตั้ง proxy เดิมชี้มาที่
  `127.0.0.1:3000` (ค่า `APP_HOST_PORT`) และต้องส่ง `X-Forwarded-For` ต่อมาด้วย ไม่งั้น rate limit
  ของฟอร์มติดต่อจะมองทุกคนเป็น IP เดียวกัน

## 2) ตั้ง GitHub Secrets

| Secret | ค่า |
|---|---|
| `SITE_URL` | `https://<โดเมน>` — ⚠️ ฝังตอน build (NEXT_PUBLIC) ถ้าผิด sitemap/OG/CSRF พังหมด |
| `CLOUDINARY_CLOUD_NAME` / `CLOUDINARY_API_KEY` | ค่าจาก Cloudinary (ใช้ตอน build) |
| `VPS_HOST` / `VPS_USER` / `VPS_SSH_KEY` | สำหรับ ssh เข้า deploy (คีย์ **private** ทั้งไฟล์) |
| `VPS_APP_DIR` | เช่น `/srv/thaingam-web` |

> `GITHUB_TOKEN` ใช้ push ขึ้น GHCR ได้เลย ไม่ต้องสร้าง PAT (workflow ตั้ง `packages: write` ไว้แล้ว)
> ครั้งแรก package ใน GHCR จะเป็น private → ให้ VPS `docker login ghcr.io` ด้วย PAT ที่มีสิทธิ์ `read:packages`
> หรือเปลี่ยน package เป็น public ในหน้า repo → Packages

## 3) Deploy ครั้งแรก

```bash
cd /srv/thaingam-web
docker compose pull
docker compose up -d          # + -f docker-compose.caddy.yml ถ้าต้องใช้ Caddy
docker compose logs -f app    # ต้องเห็น "prisma migrate deploy" แล้วตามด้วย "Ready"
```

## 4) สร้าง SUPER_ADMIN คนแรก (ทำครั้งเดียว)

`prisma/seed.ts` เรียก internal API ของ Better Auth เพื่อ hash รหัสผ่าน จึงต้องรันจาก **source จริง**
(ใน image มีแต่โค้ดที่ build แล้ว ไม่มี `lib/`) → รันจากเครื่องผู้ดูแลผ่าน SSH tunnel:

```bash
# เทอร์มินัลที่ 1 — เปิดท่อไปหา Postgres บน VPS (พอร์ต 5433 ผูกกับ 127.0.0.1 ของ VPS อยู่แล้ว)
ssh -L 5433:127.0.0.1:5433 <user>@<vps-host>

# เทอร์มินัลที่ 2 — ที่เครื่องตัวเอง ในโฟลเดอร์โปรเจกต์
DATABASE_URL="postgresql://<POSTGRES_USER>:<POSTGRES_PASSWORD>@localhost:5433/<POSTGRES_DB>?schema=public" \
SEED_ADMIN_EMAIL="admin@โดเมน" SEED_ADMIN_PASSWORD="<รหัสยาว ๆ>" SEED_ADMIN_NAME="ผู้ดูแลระบบ" \
pnpm prisma db seed
```

seed เป็น upsert รันซ้ำได้ (ถ้ามีแอดมินอยู่แล้วจะข้าม) · เสร็จแล้วปิด tunnel

## 5) Deploy รอบถัดไป

push เข้า `main` → workflow ทำให้เอง · ดูสถานะที่แท็บ Actions

**rollback:** แก้ `APP_IMAGE` ใน `.env` บน VPS ให้ชี้ tag `sha-xxxxxxxx` เดิม แล้ว `docker compose up -d`
(ทุก build ถูก pin ด้วย commit sha ไว้แล้ว)

## 6) สำรองข้อมูล

```bash
# ใน crontab ของ VPS — ทุกวันตี 3
0 3 * * * cd /srv/thaingam-web && docker compose exec -T db \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "backups/$(date +\%Y\%m\%d).sql.gz"
```

> รูป/ไฟล์อยู่บน Cloudinary (ไม่ต้องสำรองเอง) · ข้อมูลทั้งหมดของเว็บอยู่ใน Postgres

---

## ⚠️ กับดักที่เจอมาแล้ว (อย่าลืม)

1. **`next build` เคยต้องมี DB** — แก้แล้วด้วยการทำหน้า public เป็น `force-dynamic` ทั้งหมด
   → CI build ได้โดยไม่ต้องต่อ DB *(ยืนยันด้วยการ build ตอนปิด DB จริง)* · problems.md 8.6
2. **`NEXT_PUBLIC_*` ฝังตอน build** — เปลี่ยนโดเมนต้อง **build ใหม่** ไม่ใช่แค่แก้ env แล้ว restart
3. **prisma CLI copy จาก node_modules ตรง ๆ ไม่ได้** (pnpm ใช้ symlink ไป `.pnpm/`) → Dockerfile ลง CLI
   ใหม่ใน `/opt/tools` และ entrypoint ตั้ง `NODE_PATH` ให้ `prisma.config.ts` หา `dotenv` เจอ
4. **`BETTER_AUTH_URL` ต้องตรงกับโดเมนจริง** ไม่งั้น endpoint ที่เช็ค CSRF ตอบ `403 INVALID_ORIGIN`
   (เคยเจอตอน dev เพราะพอร์ตไม่ตรง — problems.md 2.2)
5. **volume `db-data` และ `caddy-data` ห้ามลบ** — อันแรกคือข้อมูลทั้งเว็บ อันหลังคือใบรับรอง HTTPS
   (ลบแล้วขอใหม่บ่อย ๆ จะโดน rate limit ของ Let's Encrypt)
