# 🐛 บทเรียน & กับดักที่เจอจริงในโปรเจกต์นี้

> รวมปัญหาที่**เจอมาแล้วกับมือ**ใน Thaingam-web พร้อมสาเหตุและทางแก้
> ใช้คู่กับ [`roadmap.md`](./roadmap.md) (ประวัติรายเฟส) และ [`spec.md`](./spec.md) (เป้าหมายปลายทาง)
>
> **ทำไมต้องมีไฟล์นี้:** ทุกครั้งที่เปิด session ใหม่ AI จะไม่รู้เรื่องพวกนี้เลย และหลายข้อ
> **ขัดกับสิ่งที่ AI จำมาจากข้อมูลเก่า** (เช่น shadcn = Radix, Prisma P2002 มี `meta.target`, Next ใช้ `middleware.ts`)
> → มันจะเขียนโค้ดผิดแบบมั่นใจมาก แล้วเราเสียเวลาไล่จับซ้ำ
>
> 📌 **อัปเดตไฟล์นี้ทุกครั้งที่เจอกับดักใหม่** — ถ้าเสียเวลากับมันเกิน 10 นาที แปลว่าควรได้อยู่ในนี้

---

## 🚀 วิธีใช้ — ก๊อปวางตอน prompt

ถ้าจะเริ่มงานใหม่ ให้วางย่อหน้านี้ใน prompt (หรือสั่งให้ AI อ่านไฟล์นี้ก่อน):

```
อ่าน docs/problems.md ก่อนเขียนโค้ด — ในนั้นมีกับดักที่เจอมาแล้วในโปรเจกต์นี้
หลายข้อขัดกับสิ่งที่คุณจำมา (shadcn ที่นี่เป็น Base UI ไม่ใช่ Radix,
Next 16 ใช้ proxy.ts ไม่ใช่ middleware.ts, Prisma 7 P2002 ไม่มี meta.target)
```

**ถ้าจะแตะเรื่องไหนเป็นพิเศษ** ให้เจาะจงเพิ่ม เช่น:

| จะทำอะไร | บอกเพิ่มว่า |
|---|---|
| ปุ่มที่เป็นลิงก์ | "ปุ่มลิงก์ต้อง `nativeButton={false}` — shadcn ที่นี่เป็น Base UI" |
| ฟอร์มใหม่ | "zod v4 → ใช้ `standardSchemaResolver` ไม่ใช่ `zodResolver`" |
| จับ error ตอน slug/email ซ้ำ | "Prisma 7 P2002 ไม่มี `meta.target` — ใช้ `isUniqueError()` ใน `lib/prisma-errors.ts`" |
| แก้ schema | "เขียน `migration.sql` เองถ้าเป็น rename แล้ว `migrate deploy` + `prisma generate` + restart" |
| จะดู SQL จริง | "`log:['query']` ของ Prisma ใช้ไม่ได้ — เปิด `log_statement` ฝั่ง Postgres" |
| Server Action ใหม่ | "ต้อง gate สิทธิ์ในตัว action เอง layout guard ไม่ครอบถึง" |
| ทดสอบ | "curl ไม่พอ ต้องคลิกจริงด้วย — React warning ไม่โผล่ใน HTTP" |

---

## 1. ⚠️ ข้อที่ "ขัดกับที่ AI จำมา" — อันตรายสุด

AI จะเขียนผิดโดยไม่ลังเลถ้าไม่บอกก่อน เพราะของเดิมในหัวมันคือคนละอย่าง

### 1.1 shadcn ที่นี่ build บน Base UI **ไม่ใช่ Radix**

- **จำมาผิดว่า:** ใช้ prop `asChild`
- **ของจริง:** ใช้ `render={<Component/>}`
- **กับดักที่เสียเวลาจริง:** `<Button render={<Link/>}>` จะพัง

  ```
  error: expected a native <button> because nativeButton is true
  ```

  → **ปุ่มที่เป็นลิงก์ต้องใส่ `nativeButton={false}` เสมอ** (Base UI default `nativeButton: true`)
  แล้วมันจะเติม `role="button"` + `tabindex="0"` ให้เอง
  ถ้า `render` เป็น `<button>` จริง ไม่ต้องใส่

- 🔍 **จับไม่ได้ด้วย curl** — เป็น React console warning ไม่ใช่ HTTP error → **ต้องคลิกจริง**

### 1.2 Next.js 16 เปลี่ยนชื่อ `middleware.ts` → **`proxy.ts`**

- ฟังก์ชันชื่อ `proxy` (ไม่ใช่ `middleware`), default Node.js runtime
- docs แนะนำให้ proxy ทำแค่ **optimistic check** (มี cookie ไหม) — **authorization จริงเช็คซ้ำ**ใน layout/Server Action
- ของจริงในโปรเจกต์: [`proxy.ts`](../proxy.ts) เช็คแค่ `getSessionCookie` + matcher `/admin/:path*`

> 📖 **AGENTS.md บังคับไว้แล้ว:** อ่าน `node_modules/next/dist/docs/` ก่อนเขียนโค้ด Next
> เวอร์ชันนี้มี breaking change เยอะ อย่าเชื่อความจำ

### 1.3 Prisma 7 + driver adapter: `P2002` **ไม่มี `meta.target`**

- **จำมาผิดว่า:** `error.meta.target.includes("slug")`
- **ของจริง:** อยู่ที่ `error.meta.driverAdapterError.cause.constraint.fields`
  (`meta` มีแค่ `{ modelName, driverAdapterError }`)
- **อาการถ้าพลาด:** slug ซ้ำจะได้ `undefined` **เงียบ ๆ** → ตกไปเป็น error กว้าง ๆ "บันทึกไม่สำเร็จ"
  แทนที่จะขึ้นตรงช่อง slug (ผู้ใช้งงว่าผิดตรงไหน)
- ✅ **แก้ที่เดียวจบแล้ว:** ใช้ `isUniqueError(error, field)` จาก [`lib/prisma-errors.ts`](../lib/prisma-errors.ts) — อ่านทั้งสองที่ให้

### 1.4 zod v4 → `standardSchemaResolver` ไม่ใช่ `zodResolver`

```ts
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
useForm({ resolver: standardSchemaResolver(schema) });
```

### 1.5 lucide v1 **ตัดไอคอนแบรนด์ออกแล้ว**

- `Youtube`, `Facebook`, ฯลฯ ไม่มีแล้ว → ใช้ไอคอนทั่วไปแทน (โปรเจกต์นี้ใช้ `SquarePlay` แทน YouTube)

### 1.6 Tiptap StarterKit v3 **รวม `extension-link` มาแล้ว**

- ลง `@tiptap/extension-link` แยก = ซ้ำ → config ผ่าน `StarterKit.configure({ link: {...} })` แทน

---

## 2. 🖥️ Environment (Windows เครื่องนี้)

### 2.1 พอร์ต 3000 ใช้ไม่ได้ — WinNAT/Hyper-V จองไว้

```
Error: listen EACCES: permission denied 0.0.0.0:3000
```

- ช่วงที่จองดูได้: `netsh int ipv4 show excludedportrange protocol=tcp` (เคยเห็น 2940–3039)
- **เปลี่ยนได้ตอน reboot/Hyper-V** — บางครั้ง 3000 ว่าง บางครั้งไม่
- ✅ **แก้ถาวรแล้ว:** ฝัง `-p 4000` ใน `package.json` (`dev` + `start`) → `pnpm dev` เฉย ๆ ขึ้น 4000 เอง
  **ไม่ต้องใส่ `PORT=4000` นำหน้าอีก**

### 2.2 `BETTER_AUTH_URL` ต้องตรงกับพอร์ตที่รันจริง

- ไม่ตรง → endpoint ที่เช็ค CSRF ตอบ **`403 INVALID_ORIGIN`**
- 😈 **ร้ายตรงที่:** `sign-in/email` **ไม่โดนเช็ค origin** → login ผ่านปกติ เลยไม่มีใครเอะใจ
  แต่ `admin/create-user` พัง (เจอตอน Phase 4.3)
- ทดสอบ endpoint พวกนี้ด้วย curl ต้องส่ง `-H "Origin: http://localhost:4000"` ไม่งั้นได้ `403 MISSING_OR_NULL_ORIGIN`

### 2.4 dev server ตอบ 500 ทุกหน้า — `EPERM rename .next/dev/...manifest.js`

- อาการ: เพิ่งสั่ง `pnpm dev` แล้ว**ทุก** route เป็น **500** · log ขึ้นซ้ำ ๆ
  `Error: EPERM: operation not permitted, rename '...\.next\dev\server\...-manifest.js.tmp.xxx' -> '...-manifest.js'`
- สาเหตุ (Windows): มี process เก่าค้าง lock ไฟล์ใน `.next` หรือ AV เข้าจับ → Turbopack เขียน manifest ทับไม่ได้
- ✅ **แก้:** kill ตัวที่ค้างพอร์ต 4000 → ลบ `.next` ทิ้ง → `pnpm dev` ใหม่
  ```powershell
  Get-NetTCPConnection -LocalPort 4000 -State Listen | Select -Expand OwningProcess -Unique | ForEach { Stop-Process -Id $_ -Force }
  ```
  ```bash
  rm -rf .next && pnpm dev
  ```
- ℹ️ อย่าเพิ่งไล่หาบั๊กในโค้ดที่เพิ่งเขียน — 500 แบบนี้เป็น build cache ไม่ใช่ตรรกะ (เจอ 4.4.4)

### 2.3 Database dev

- Docker container `thaingam-postgres`, host port **5436** → 5432, db `thaingamweb`, user **`tguser`** (ไม่ใช่ `postgres`)
- query ตรง: `docker exec thaingam-postgres psql -U tguser -d thaingamweb -c '...'`
- ⚠️ ภาษาไทยใน psql บน Windows แสดงเป็น `?????` — **เป็นแค่ encoding ของ console ข้อมูลใน DB ไม่ได้พัง**

---

## 3. 🗄️ Prisma 7 (นอกจาก P2002)

### 3.1 🔥 **ไม่มี migrate ตัวไหน generate client ให้เลย** — ต้อง `prisma generate` เองเสมอ

- เดิมเข้าใจว่า "`migrate deploy` ไม่ generate แต่ `migrate dev` generate ให้" — **ผิด**
  ยืนยัน 2026-07-17 (Phase 4.4.3): `migrate dev --name add_media_work` ลงตารางสำเร็จ
  แต่ `lib/generated/prisma/client.ts` **ยังเป็นไฟล์เดิมของเมื่อวาน** → `prisma.mediaWork` ไม่มี
- **อาการ:** `Property 'mediaWork' does not exist on type 'PrismaClient'` หรือ `P2021 TableDoesNotExist`
  ตอน rename/`@@map` (ตาราง/model ใหม่มีใน DB แล้วแต่ client ไม่รู้จัก)
- ✅ **ท่ามาตรฐานหลังแตะ schema ทุกครั้ง:**
  ```bash
  pnpm prisma migrate dev --name <name>   # (หรือเขียน migration.sql เอง + migrate deploy)
  pnpm prisma generate                    # ← ห้ามลืม ไม่มีใครทำให้
  # แล้ว restart dev server (ดู 3.2)
  ```
- ℹ️ `--skip-seed` **ไม่มีแล้วใน Prisma 7** (ใส่ไปจะเด้ง help ออกมา) — seed เป็น upsert รันซ้ำได้อยู่แล้ว

### 3.2 dev server ถือ client ไว้ในหน่วยความจำ → **ต้อง restart**

- ไม่ restart หลัง generate จะได้ `TypeError: Cannot read properties of undefined (reading 'count')` (model ใหม่เป็น `undefined`)
- 😈 **กับดักซ้อน (เจอ 4.4.3):** สั่ง `pnpm dev` ใหม่ทั้งที่ตัวเก่ายังรันอยู่ → ตัวใหม่ตายทันทีด้วย
  `EADDRINUSE :::4000` **แต่ตัวเก่ายังตอบ request อยู่** → เห็น 500 ที่หาสาเหตุไม่เจอ เพราะนึกว่ารัน server ใหม่แล้ว
  ```powershell
  # ฆ่าตัวที่ค้างพอร์ต 4000 ก่อน
  Get-NetTCPConnection -LocalPort 4000 -State Listen | Select -Expand OwningProcess -Unique | ForEach { Stop-Process -Id $_ -Force }
  ```

### 3.3 rename ตาราง — **อย่าให้ Prisma ทำเอง จะข้อมูลหาย**

- Prisma จะ **drop + create** (ข้อมูลหายหมด) → เขียน `migration.sql` เองด้วย `ALTER TABLE ... RENAME`
- `migrate dev` ต้องการ interactive confirm ตอนมี destructive step (AI รันไม่ได้)
  → เขียนไฟล์ใน `prisma/migrations/<timestamp>_<name>/` เองแล้ว `migrate deploy`

### 3.4 seed ตั้งใน **`prisma.config.ts`** ไม่ใช่ `package.json`

- Prisma 7 เลิกใช้ `prisma.seed` ใน `package.json` → ใช้ `migrations.seed = "tsx prisma/seed.ts"`

### 3.5 สคริปต์ `tsx` เดี่ยว ๆ import `@/lib/prisma` ไม่ได้

- `.env` ไม่ถูกโหลด + `lib/rbac.ts` มี `server-only`
- → ในสคริปต์ต้อง `import "dotenv/config"` + สร้าง `new PrismaClient({ adapter: new PrismaPg(...) })` เอง
- (หรือใช้ psql ผ่าน docker ง่ายกว่า)

### 3.6 🔥 `log: ['query']` **ไม่ emit อะไรเลย** เมื่อใช้ driver adapter

- `new PrismaClient({ adapter, log: [{ emit:"stdout", level:"query" }] })` → **เงียบสนิท**
- **อยากเห็น SQL จริงต้องเปิดฝั่ง Postgres:** ดูหัวข้อ 6

---

## 4. 🔐 Better Auth

- `nextCookies()` **ต้องเป็น plugin ตัวสุดท้ายเสมอ**
- custom role (`SUPER_ADMIN`/`ADMIN`/`TEACHER`) **ต้องนิยามใน `roles`** ผ่าน `createAccessControl` ([`lib/permissions.ts`](../lib/permissions.ts))
  ไม่งั้นได้ default `user`/`admin` ของ Better Auth
- `emailAndPassword.disableSignUp: true` — ปิดสมัครเอง (ก่อนหน้านี้เปิดอยู่ → ใครก็สมัครเป็น TEACHER แล้วเข้า `/admin` ได้ ขัด spec §3)
- **seed user ต้องผ่าน `auth.$context` + `internalAdapter`** (hash scrypt เอง) — เรียก `auth.api.signUp` ตรง ๆ ไม่ได้เพราะ `nextCookies` จะไปเรียก `next/headers` ซึ่งไม่มีในสคริปต์
- `session.cookieCache` มีจริง (`@better-auth/core` → `init-options.ts`) — ยังไม่เปิด ถ้าอยากตัด DB hit ทิ้งทั้งหมด

---

## 5. ⚛️ React / Next patterns ที่ได้บทเรียน

### 5.1 session ถูก query ซ้ำ 2 รอบต่อ request (แก้แล้ว)

- **สาเหตุ:** `layout.tsx` เรียก `requireRole()` และ `page.tsx` เรียกอีกที — Better Auth ใช้ Prisma (ไม่ใช่ `fetch`) เลย**ไม่มี memoize ให้อัตโนมัติ**
- **แก้:** ครอบ `getSession` ด้วย **`React.cache()`** ใน [`lib/rbac.ts`](../lib/rbac.ts)
- **วัดผลจริง:** session lookup 2→1, user lookup 2→1 ต่อ request
- 📖 pattern นี้มาจาก Next docs เอง: `02-guides/authentication.md` (DAL + `server-only`) และ
  `02-guides/caching-without-cache-components.md` ("ไม่ได้ใช้ fetch แต่ใช้ ORM ตรง ๆ → ครอบด้วย React `cache`")

### 5.2 dialog ที่ไม่ unmount ตอนปิด → ค่าเก่าค้าง

- กด "แก้ไข" รายการ A → ปิด → กด "แก้ไข" รายการ B → **เห็นค่าของ A ค้าง**
- **แก้:** `useEffect` reset ค่าทุกครั้งที่ `open` เป็น true ([`taxonomy-dialog.tsx`](../components/admin/taxonomy-dialog.tsx))

### 5.4 🐛 `CldUploadWidget` (next-cloudinary) แย่ง focus ตอนกำลังพิมพ์

- **อาการ:** เข้าฟอร์มที่มี `ImageUpload` → คลิกพิมพ์ในช่องแรก (เช่น ชื่อ) → **รอแป๊บ เคอร์เซอร์หลุดเอง** ต้องพิมพ์ใหม่
- **สาเหตุ (ยืนยันจาก source `next-cloudinary@6`):** `CldUploadWidget` โหลด `all.js` ทันทีที่ mount แล้ว
  `onLoad` เรียก `createUploadWidget()` เลย → **ฉีด iframe ของ widget เข้า DOM ทันทีที่สคริปต์โหลดเสร็จ**
  การแทรก iframe แย่ง focus จาก input ที่กำลังพิมพ์ (ดีเลย์ = เวลาโหลดสคริปต์ = "รอแป๊บ")
- ✅ **แก้ (เดียวจบทุกฟอร์ม):** [`image-upload.tsx`](../components/admin/image-upload.tsx) — **lazy mount** widget
  เฉพาะหลังกด "อัปโหลด" (ก่อนกดเป็นปุ่มเปล่า ไม่โหลดสคริปต์) แล้ว auto-open พอ `isLoading` เป็น false
- 🔍 **curl จับไม่ได้** (200 หมด) — เป็น DOM/focus timing → ต้องคลิกจริงถึงเจอ (บทเรียนข้อ 7.1 อีกครั้ง)

### 5.5 🐛 เปลี่ยน `<input type>` บน element เดิม → ค่าที่ไม่ตรง type ถูกล้าง + ยิง `onChange("")`

- **เจอที่:** ฟอร์มกิจกรรม toggle "ทั้งวัน" สลับ `datetime-local` ↔ `date` บน `<input>` ตัวเดิม
- **อาการ:** วันที่ที่กรอกไว้**หายเกลี้ยง** ต้องกรอกใหม่ — ทั้งที่ handleAllDayChange normalize ค่าไว้แล้ว
- **สาเหตุ:** พอ `type` เปลี่ยนบน element เดิม ค่าเดิม (`2026-07-20T09:00`) ใช้กับ `type="date"` ไม่ได้
  → เบราว์เซอร์**ล้างค่าทิ้งแล้วยิง `onChange("")`** ทับค่าที่เพิ่ง setValue ไว้ (เกิดหลัง handler)
- ✅ **แก้:** ใส่ `key` ผูกกับ allDay ให้ input **remount เป็น element ใหม่** พร้อม `type` + `defaultValue` ที่ถูกต้อง
  ตั้งแต่แรก → ไม่มีจังหวะที่ค่าไม่ตรง type เลย ([`event-form.tsx`](../components/admin/event-form.tsx))
- 🔍 curl จับไม่ได้ (เป็น DOM interaction) — ต้องคลิก toggle จริงถึงเจอ

### 5.6 🐛 ลิงก์ Google Drive (`lh3.googleusercontent.com/d/<id>`) วางเป็นรูปแล้วไม่ขึ้น

- **อาการ (เจอ 4.4.5):** วางลิงก์ Drive ในช่องรูปของ `ImageUpload` → preview ว่าง/รูปแตก เงียบ ๆ ไม่บอกอะไร
- **สาเหตุ:** ไฟล์ที่ **ยังไม่แชร์สาธารณะ** → ลิงก์เด้ง `302` หลายทอดไปจบที่ **หน้า login ของ Google** (`accounts.google.com/signin`)
  ตอบกลับเป็น `text/html` ไม่ใช่ byte รูป → `<img>` โหลดไม่ได้ (ตรวจด้วย `curl -IL` เห็น redirect chain + `content_type=text/html`)
- ⚠️ ต่อให้แชร์ "Anyone with the link" แล้ว Drive ก็ **rate-limit + เปลี่ยนรูปแบบลิงก์บ่อย** — hotlink ไม่เสถียรสำหรับ production
- ✅ **ทางหลักคือปุ่ม "อัปโหลด" (Cloudinary signed upload)** — Drive เป็นแค่ fallback · วาง URL ตรงควรเป็น image host ที่คืน `image/*` ให้ anonymous
- ✅ **เพิ่ม feedback แล้ว:** `<img onError>` ใน [`image-upload.tsx`](../components/admin/image-upload.tsx) โชว์กล่อง "โหลดรูปไม่สำเร็จ..." แทนที่จะเงียบ
  (เก็บ **URL ที่ fail** ไม่ใช่ boolean → พอวางลิงก์ใหม่ reset เองตอน render · เลี่ยง `setState` ใน effect ที่ lint `react-hooks/set-state-in-effect` จับ)

### 5.3 Tiptap

- **`immediatelyRender: false` บังคับใน Next (SSR)** ไม่งั้น hydration mismatch
- **ปุ่ม toolbar ทุกตัวต้อง `type="button"`** — อยู่ใน `<form>` ถ้าลืมจะ submit ฟอร์มทิ้งทันทีที่กด
- 🐛 **`setLink()` บน selection ว่าง = stored mark** → **ไม่มีอะไรขึ้นบนจอ** (จำไว้ให้ตัวที่พิมพ์ถัดไปแทน)
  ดูเหมือนปุ่มเสียทั้งที่ทำงาน → เช็ค `selection.empty && !isActive("link")` แล้ว `insertContent` URL เป็นข้อความที่มี link mark

---

## 6. 🔬 วิธี debug ที่ใช้ได้จริง (Postgres)

ใช้ตอนอยากรู้ว่า "จริง ๆ แล้วยิง query กี่ครั้ง" — เพราะ Prisma log ใช้ไม่ได้ (ข้อ 3.6)

```bash
# เปิด — ⚠️ ทีละคำสั่ง! ใส่ 2 คำสั่งใน -c เดียว psql จะห่อเป็น transaction
#    แล้วขึ้น "ALTER SYSTEM cannot run inside a transaction block"
docker exec thaingam-postgres psql -U tguser -d thaingamweb -c "ALTER SYSTEM SET log_statement='all'"
docker exec thaingam-postgres psql -U tguser -d thaingamweb -c "SELECT pg_reload_conf()"

# คั่น marker ก่อนยิง request ที่จะวัด แล้วตัดเอาเฉพาะช่วงหลัง marker
docker exec thaingam-postgres psql -U tguser -d thaingamweb -c "SELECT 'MARKER_123'"
curl ... http://localhost:4000/admin
docker logs thaingam-postgres --since 60s | sed -n "/MARKER_123/,\$p"

# ปิดเมื่อเสร็จ — อย่าลืม! log บวมและช้า
docker exec thaingam-postgres psql -U tguser -d thaingamweb -c "ALTER SYSTEM RESET log_statement"
docker exec thaingam-postgres psql -U tguser -d thaingamweb -c "SELECT pg_reload_conf()"
```

⚠️ **กับดักตอนอ่าน log** (ทำให้ผมนับได้ 0 แล้วเกือบสรุปผิดว่า "ไม่มี query"):

| คิดว่า | ของจริง |
|---|---|
| `statement: SELECT ...` | **`execute <unnamed>: SELECT ...`** (extended protocol) |
| `FROM "session"` | **`FROM "public"."session"`** |

---

## 7. 🧪 บทเรียนเรื่อง "การทดสอบ" — สำคัญที่สุด

### 7.1 curl ผ่านหมด ≠ ใช้งานได้

HTTP 200 บอกได้แค่ว่า server ไม่พัง **จับไม่ได้เลย**:
- React console warning (บั๊ก `nativeButton` โผล่ตอนคลิกเท่านั้น)
- ปุ่มกดแล้วไม่มีอะไรเกิด (บั๊ก Tiptap `setLink`)
- ค่าค้างใน dialog
- อัปโหลดขึ้นจริงไหม

→ **ทุกโมดูลต้องมีรอบ "คลิกจริง" เสมอ** อย่าติ๊กเสร็จจาก curl อย่างเดียว

### 7.2 Server Action **ไม่ได้ถูกป้องกันด้วย layout guard**

- `proxy.ts` เช็คแค่ว่ามี cookie · layout เช็ค role — แต่ **Server Action ถูกยิงตรงจาก client ได้เลย ไม่ผ่านทั้งคู่**
- → **ทุก action ต้องเช็คสิทธิ์ในตัวเอง** (`requireContentManager()` ที่ต้นฟังก์ชัน)
- **ทดสอบได้จริง** (ทำแล้วใน 4.4.2):
  ```bash
  # 1) ดึง action id
  node -e "console.log(Object.keys(require('./.next/dev/server/app/admin/categories/page/server-reference-manifest.json').node))"
  # 2) ยิงตรงด้วย cookie ของ role ที่ไม่ควรมีสิทธิ์
  curl -b cookie.txt -X POST http://localhost:4000/admin/categories \
    -H "Next-Action: <id>" -H "Content-Type: application/json" \
    -H "Origin: http://localhost:4000" -d '[{"name":"x","slug":"x"}]'
  ```

### 7.3 🎯 **ต้องมี positive control เสมอ**

บทเรียนแพงสุดของ session นี้:

> TEACHER ยิง action → ถูกปฏิเสธทั้ง 6 ตัว → **ยังสรุปไม่ได้ว่า RBAC ทำงาน**
> เพราะมันอาจถูกปฏิเสธเพราะ request เราผิดรูปแบบก็ได้!
> → ต้องยิง **request รูปแบบเดียวกันเป๊ะ** ด้วย ADMIN แล้วเห็น `"ok":true` ถึงจะพิสูจน์ได้ว่า
> **ตัวที่บล็อกคือ RBAC ไม่ใช่ payload พัง**

หลักเดียวกันใช้กับ **grep ที่ได้ 0** — ต้องเช็คก่อนว่า pattern เจออะไรได้จริงไหม
(ผมเจอ 2 รอบใน session เดียว: grep Prisma log และ grep PG log — ข้อมูลอยู่ครบ แต่ regex ผิด)

### 7.4 เช็ค env ให้ครบ **ก่อน**สั่งให้คนไปทดสอบ

- เช่น `CldUploadWidget` ต้องมี **`NEXT_PUBLIC_CLOUDINARY_API_KEY`** ฝั่ง client ด้วย
  (`CLOUDINARY_API_SECRET` **ห้าม** เป็น `NEXT_PUBLIC_` เด็ดขาด — ใช้เซ็นที่ `/api/sign-cloudinary-params` เท่านั้น)

---

## 8. 📋 บทเรียนเรื่องแผน/กระบวนการ

### 8.1 แผนที่เขียนไว้อาจ **เป็นไปไม่ได้จริง** — เช็คตอนลงมือ

- roadmap เขียน "4.4.2 CRUD + **slug อัตโนมัติ**" → พอลงมือถึงรู้ว่า **ทำไม่ได้**
  ชื่อหมวดหมู่เป็นภาษาไทย แต่ `slugSchema` บังคับ `a-z0-9-` → auto-gen ได้ **string ว่าง**
  และ slug ที่ต้องการจริงคือ**คำแปลอังกฤษที่คนเลือกเอง** (`ข่าวประชาสัมพันธ์`→`announcements`) ไม่มีอัลกอริทึมทำให้ได้
- → **ถ้าเจอข้อขัดแย้งแบบนี้ ให้ทักก่อนลงมือ** อย่าเงียบแล้วทำอย่างอื่นแทน

### 8.2 commit ให้เร็ว

- เคยปล่อยงาน 4.0–4.4.1 (78 ไฟล์) ค้างใน working tree **ไม่ commit เลยสักครั้ง** — ถ้าเครื่องมีอะไรคือหายทั้งก้อน
- ประวัติรายเฟสอยู่ใน `roadmap.md` อยู่แล้ว → **git history ไม่ต้องซ้ำ** (ก้อนแรกเลยรวบ 4.0–4.4.1 ก้อนเดียว
  เพราะ `package.json`/`pnpm-lock.yaml`/`schema.prisma` สะสมข้ามเฟส แยกย้อนหลังแล้ว commit กลางทาง build ไม่ผ่าน)

### 8.3 อย่าเก็บค่าที่ "คำนวณได้" ลง DB ถ้ามันจะกลายเป็นค่าที่แก้เองไม่ได้

- เจอตอน 4.4.3: derive รูปปกจากลิงก์ YouTube แล้ว**เก็บลง DB** → หน้าแก้ไขโหลดค่านั้นกลับมาเป็นค่าในช่อง
  → แยกไม่ออกแล้วว่า "ระบบเดาให้" หรือ "แอดมินตั้งเอง" → **เปลี่ยนลิงก์คลิป รูปปกยังชี้คลิปเก่าเงียบ ๆ**
- → เก็บเฉพาะ**สิ่งที่ผู้ใช้ตั้งเอง** (null = ยังไม่ตั้ง) แล้ว**คำนวณตอนแสดงผล** — ดู `mediaWorkThumbnail()` ใน `lib/media-work.ts`

### 8.4 อย่า abstract ก่อนเห็น pattern ซ้ำจริง

- 4.3 ตั้งใจ**ไม่**ทำ `DataTable` generic → 4.4.1 ใช้ `table-search` + `table-pagination` + `ui/table` ตรง ๆ
- พอถึง **4.4.2 (ผู้ใช้รายที่ 2)** ถึงยกของกลางออกมา: `slugSchema` → `lib/validations/slug.ts`,
  `isUniqueSlugError` → `lib/prisma-errors.ts`, `ActionResult` → `server/actions/types.ts`
- ⚠️ ไฟล์ `"use server"` **export ได้แต่ async function** → type ต้องอยู่ไฟล์อื่น

### 8.5 ธีมสียังเป็น placeholder

- base color = `neutral` → **ทุก token chroma = 0 (เทาล้วน ไม่มีสี)**
  `--primary: oklch(0.205 0 0)` vs `--foreground: oklch(0.145 0 0)` ต่างกันแค่ความเข้ม
- ผลคือ **ลิงก์ในเนื้อหาแยกจากข้อความธรรมดาด้วยขีดเส้นใต้อย่างเดียว — ไม่ใช่บั๊ก**
- สีจริงของแบรนด์โรงเรียนรอ Phase 4.8 · จุดเสียบ typography ของ Tiptap = class `prose-editor` (ยังเป็น class เปล่า)
