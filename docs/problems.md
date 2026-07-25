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
- ✅ **แก้:** kill ตัวที่ค้างพอร์ต 4000 → **`sleep 3` รอ OS ปล่อย file handle** → ลบ `.next` ทิ้ง → `pnpm dev` ใหม่
  ```powershell
  Get-NetTCPConnection -LocalPort 4000 -State Listen | Select -Expand OwningProcess -Unique | ForEach { Stop-Process -Id $_ -Force }
  ```
  ```bash
  sleep 3 && rm -rf .next && pnpm dev
  ```
- ⚠️ **เจอซ้ำใน 4.4.10 — จังหวะสำคัญ:** ถ้า `rm -rf .next` + start ตัวใหม่ **ทันที**หลัง kill (ยังไม่ทัน sleep)
  dev ตัวเก่ายังถือ handle `.next/dev/server/*manifest.js` ค้าง → ตัวใหม่ rename ทับไม่ได้ → EPERM ซ้ำ 500 ทุกหน้าเหมือนเดิม
  → **kill แล้วรอ handle ปล่อยก่อนเสมอ** (`sleep 3`) ค่อยลบ+start · ยืนยันว่าหายด้วย `grep -c EPERM` ใน log = 0 ก่อนไป verify
- 🔁 **มักเจอหลัง `prisma generate`** (regenerate client → ต้อง restart dev อยู่แล้ว → เข้าลูป kill/rm/start นี้พอดี)
- ℹ️ อย่าเพิ่งไล่หาบั๊กในโค้ดที่เพิ่งเขียน — 500 แบบนี้เป็น build cache ไม่ใช่ตรรกะ (เจอ 4.4.4, 4.4.10)

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

### 5.7 🐛 Tailwind v4 **strip `@keyframes` + custom animation class ที่เขียน raw CSS ทิ้ง** → animation ไม่ทำงาน (นิ่งสนิท)

- อาการ: เขียน `@keyframes marquee {...}` + `.animate-marquee { animation: marquee 28s ... }` ตรง ๆ ใน `globals.css` → **ไม่ออกใน CSS ที่ compile เลย** (grep คำว่า `marquee` ใน `/_next/static/*.css` = 0) → element นิ่ง
  เพราะ Tailwind v4 (Oxide + Lightning CSS) เก็บเฉพาะสิ่งที่มันรู้จัก · raw keyframe/class ที่ไม่ผ่าน engine ถูกตัด
- ✅ **วิธีถูก:** ลง animation ผ่าน **`@theme`** ให้ Tailwind gen utility + เก็บ keyframe ให้:
  ```css
  @theme {
    --animate-marquee: marquee 28s linear infinite;   /* → gen .animate-marquee */
    @keyframes marquee { from {…} to {…} }             /* วาง keyframe ใน @theme ด้วย */
  }
  ```
  แล้วใช้ `className="animate-marquee"` ได้ปกติ · hover/variant ใช้ arbitrary `hover:[animation-play-state:paused]` ที่ className (อย่าเขียน `.x:hover{}` raw — โดน strip เหมือนกัน)
- **ยืนยันว่า animate จริง (ไม่ใช่แค่ CSS มา):** อ่าน `getComputedStyle(el).transform` 2 ครั้งห่างกัน ~700ms ผ่าน **Chrome CDP** — ถ้า matrix เปลี่ยน = เลื่อนจริง (screenshot นิ่งดูไม่ออก)
- 📝 **marquee ที่ดูปลิเคต content 2 ชุด (loop -50%) จะเห็นซ้ำตอน content สั้นกว่ากรอบ** (จอกว้าง) → วัด `scrollWidth > clientWidth` ด้วย `ResizeObserver` แล้ว **duplicate + เลื่อนเฉพาะตอนล้น** ไม่งั้นแสดงชุดเดียวนิ่ง

### 5.8 🐛 min-width:auto ทำ **horizontal overflow ทั้งหน้า** (grid/flex child ไม่ยอมหด)

- อาการ: มือถือเลื่อนแนวนอนได้ · ข้อความ/การ์ดคลิปขอบขวาทั้งหน้า (ไม่ใช่แค่ element เดียว — ตัวที่กว้างสุดดัน `body` scrollWidth)
- 2 ต้นตอที่เจอ (Hero + marquee): **(1)** `grid` ไม่ใส่ `grid-cols-1` ฐาน → auto track ขยายตาม max-content เกิน viewport (ต้อง `grid-cols-1` = `minmax(0,1fr)`) · **(2)** flex child ที่ครอบ content กว้าง (`w-max`, nowrap) ขาด **`min-w-0`** → ไม่หดต่ำกว่า content
- ✅ กฎ: **grid/flex child ที่ต้องหดได้ ใส่ `min-w-0`** (+ grid ใส่ `grid-cols-1` ฐานเสมอถ้าจะ override เป็นหลายคอลัมน์ที่ lg)
- **วัด/หา element ผิด:** Chrome CDP `Emulation.setDeviceMetricsOverride` (จำลองกว้างเป๊ะ) → eval `document.documentElement.scrollWidth - clientWidth` + ไล่ `getBoundingClientRect().right > vw` · ⚠️ `chrome --screenshot` แยก instance จับภาพตอน dev **recompile** ได้ภาพ **stale** — เชื่อ CDP ที่โหลดเสร็จแล้วแทน

### 5.9 🔥 metadata ของหน้า **ทับ `openGraph` ของ layout ทั้งก้อน** (merge แบบ shallow) → `og:image` หายเงียบ ๆ

- Next merge metadata ระหว่าง segment แบบ **shallow** — field ซ้อนอย่าง `openGraph`/`robots` ที่ประกาศใน page
  จะ **แทนที่** ของ layout ทั้งอ็อบเจกต์ ไม่ใช่รวมกัน *(Next docs `generate-metadata.md` §Ordering)*
- อาการจริงที่เจอ (Phase 4.7): หน้าผลงานที่ไม่มีรูปปกตั้ง `openGraph` เอง (เพื่อใส่ `type:"article"`)
  → **ไม่มี `og:image` เลยสักแท็ก** ทั้งที่มี `opengraph-image.tsx` อยู่ (รูปจาก file convention หายไปด้วย)
  · และตั้ง `openGraph.title` ที่ layout → **ทุกหน้าได้ `og:title` เป็นชื่อเว็บ** ไม่ใช่ชื่อหน้า
- ✅ วิธีที่ใช้: ยกค่าที่ใช้ร่วมออกเป็นตัวสร้างกลาง **`lib/metadata.ts` → `buildOpenGraph()`/`buildTwitter()`**
  แล้วให้ทุกหน้าเรียกตัวนี้ (ใส่ `siteName`/`locale`/รูป fallback ให้ครบทุกครั้ง) · **ที่ layout อย่าตั้ง `openGraph.title/description`**
  ปล่อยว่างไว้ Next จะตกไปใช้ `title`/`description` ของหน้านั้นเอง
- **ตรวจยังไง:** `curl` หน้าจริงแล้ว grep `<meta property="og:` ทีละหน้า — ไม่ใช่ดูแค่หน้าเดียวแล้วเหมา

### 5.10 🖼️ `ImageResponse` (`next/og`) **ไม่มีฟอนต์ไทย** → ได้กล่องสี่เหลี่ยม + path ของ `opengraph-image` มี hash

- ฟอนต์ที่มากับ `next/og` คือ **Geist (ละตินล้วน)** → ข้อความไทยกลายเป็น tofu ต้องส่ง `fonts:[{name,data,weight}]` เอง
- **ดึง TTF จาก Google Fonts:** `curl -H "User-Agent: Mozilla/5.0" "https://fonts.googleapis.com/css2?family=Anuphan:wght@600"`
  → ได้ URL `.ttf` · ⚠️ **UA เป็น MSIE จะได้ EOT** (satori อ่านไม่ออก) และ UA เบราว์เซอร์ใหม่จะได้ **woff2** (อ่านไม่ออกเหมือนกัน)
  → ตรวจไฟล์ที่โหลดมาด้วย `file x.ttf` ต้องขึ้น *TrueType Font data* · เก็บไว้ที่ `assets/` (ไม่ใช่ `public/` — ไม่ต้อง serve)
- ⚠️ **`opengraph-image.tsx` (file convention) อ้างอิงตรงไม่ได้** — URL จริงคือ `/opengraph-image-<hash>?<id>` ส่วน `/opengraph-image` ตอบ **404**
  (เผลอเอาไปใส่ JSON-LD `image` แล้วเป็นลิงก์เสีย) → โปรเจกต์นี้ทำเป็น route **`app/og.png/route.tsx`** URL คงที่แทน แล้วอ้างจาก `lib/metadata.ts`
- ตรวจผลด้วยตาเสมอ: `curl -o og.png localhost:4000/og.png` แล้ว**เปิดดูรูป** (200 + `image/png` ไม่ได้แปลว่าตัวอักษรไม่ใช่กล่อง)

### 5.11 ⏱️ `sitemap.ts` / `robots.ts` / route ที่อ่าน DB = **static ตั้งแต่ build** ถ้าไม่ตั้ง `revalidate`

- ทั้งคู่เป็น Route Handler พิเศษ **ที่ Next cache ให้เองถ้าไม่ได้ใช้ request-time API** → เห็นได้จาก build output `○ /sitemap.xml`
- ผลคือ **sitemap แช่แข็งตั้งแต่วันที่ deploy** — แอดมินโพสต์ข่าวใหม่กี่ชิ้น Google ก็ไม่เห็น
- ✅ แก้ด้วย `export const revalidate = 3600` (หรือ `dynamic = "force-dynamic"` ถ้าต้องสดทันที) · build output จะขึ้น `○ /sitemap.xml  1h`

### 5.12 🔥 `loading.tsx` ทำให้ `notFound()` ตอบ **200 แทน 404** (soft 404)

- ไฟล์ `loading.tsx` = สร้าง Suspense boundary → response ของ**ทุกหน้าใต้ segment นั้น**กลายเป็น **streaming**
  → header ถูกส่งไปก่อนแล้ว **เปลี่ยน status ทีหลังไม่ได้** ⇒ หน้าที่เรียก `notFound()` ได้ **HTTP 200**
  (Next ใส่ `<meta name="robots" content="noindex">` ให้แทน — Google ไม่ index แต่สถานะยังผิด)
- 📖 เป็นพฤติกรรมที่ Next เขียนไว้ตรง ๆ ใน `03-file-conventions/loading.md` §Status Codes ไม่ใช่บั๊ก
- **วัดจริงในโปรเจกต์นี้ (Phase 4.8):** `/mua-mua-slug` → มี `(public)/loading.tsx` = **200** · ย้ายไฟล์ออก = **404** (ทดสอบสลับไปกลับ)
- ✅ ทางที่เลือก: **ไม่วาง `loading.tsx` ที่ระดับ route group** แล้วทำแทนด้วย
  1. `loading.tsx` เฉพาะ segment ที่**ไม่มีหน้า detail** (`/staff` `/documents` `/calendar` `/contact` `/about` `/search`)
  2. หน้าลิสต์ที่มี `[slug]` เป็นลูก (`/news` `/works` `/albums`) → ใช้ **`<Suspense>` ในไฟล์หน้านั้น** ครอบเฉพาะส่วนที่ query
     (กระทบแค่หน้านั้น ลูกไม่โดน) · ใส่ `key` ตาม searchParams ให้ skeleton ขึ้นใหม่ตอนเปลี่ยนตัวกรอง
- ⚠️ หลังบ้าน (`/admin`) วาง `loading.tsx` ได้ตามปกติ — `noindex` อยู่แล้วและไม่มี SEO ให้เสีย

### 5.13 🧼 sanitize HTML จาก Tiptap ก่อน `dangerouslySetInnerHTML`

- ใช้ `sanitize-html` (ทำงานฝั่ง server ไม่ต้องมี DOM) → `lib/sanitize.ts` `sanitizeRichText()`
- **กัน*ตอนแสดงผล* ไม่ใช่ตอนบันทึก** — เนื้อหาเก่าใน DB ปลอดภัยด้วย และเปลี่ยนกฎทีหลังไม่ต้องแก้ข้อมูล
- allowlist ต้องยอม **`iframe` เฉพาะ YouTube** (`allowedIframeHostnames`) ไม่งั้นวิดีโอที่แทรกด้วย `extension-youtube` หายทั้งหมด
  → **เพิ่มแท็กใน allowlist ทุกครั้งที่เพิ่ม extension ให้ editor**
- ทดสอบด้วยการ **insert เนื้อหาอันตรายลง DB จริงแล้วเปิดหน้า** (12 เคส: `<script>` / `onerror` / `javascript:` / iframe เว็บอื่น / `<style>` ถูกตัด ·
  h2/strong/li/ลิงก์/iframe YouTube ยังอยู่) — **positive control สำคัญพอ ๆ กับ negative** ไม่งั้นแยกไม่ออกระหว่าง "กันได้" กับ "ล้างทิ้งหมด"

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

### 7.5 🇹🇭 ยืนยันผลด้วย query ที่มีภาษาไทย: `LIKE 'ไทย%'` ผ่าน `docker exec -i psql` คืน 0 ทั้งที่มีแถว

- เจอใน 4.4.9: ยิง Server Action สร้างประกาศ (message ภาษาไทย) แล้วเช็คด้วย
  `psql -tAc "SELECT count(*) ... WHERE message LIKE 'ยิงตรงจาก%'"` → ได้ **0** เลยหลงคิดว่า action ไม่เข้า DB
  ที่จริง**เข้าแล้ว** (เจอเป็นแถวค้างตอนเก็บกวาด) — client_encoding ของ session ที่ยิงผ่าน `docker exec -i … <<'SQL'` / `-c "…ไทย…"` เพี้ยน
  ทำให้ literal ไทยไม่ตรงกับ bytes ที่เก็บ (UTF-8) → LIKE ไม่ match
- นี่คือ **7.3 ซ้ำในรูปแบบใหม่**: "0" อาจแปลว่า "ไม่มีจริง" หรือ "query เอง match ไม่ได้" — แยกไม่ออกถ้าไม่มี control
- **กติกา:** ให้ test data ใช้ **token ASCII** (`POSCTRL-…` / `NEGCTRL-…`) เป็นตัวชี้วัด — LIKE/`=` ตรงเสมอ ไม่ผ่านชั้น encoding
  · ลบข้อมูลไทยให้ลบด้วย `id` (ASCII) ไม่ใช่ `WHERE message LIKE 'ไทย%'`

### 7.6 🔓 Better Auth admin plugin: `adminRoles` + `ac` ให้สิทธิ์ **จริง** — ADMIN ตั้ง role ตัวเองเป็น SUPER_ADMIN ได้

**ช่องโหว่ privilege escalation (เจอ + แก้ใน 4.4.13):** เดิม `lib/auth.ts` ตั้ง `adminRoles: ["SUPER_ADMIN","ADMIN"]`
และ `lib/permissions.ts` ให้ `ADMIN = ac.newRole({ ...adminAc.statements })` (สิทธิ์จัดการ user เต็ม)
→ ADMIN ยิง `POST /api/auth/admin/set-role` ตั้งตัวเองเป็น SUPER_ADMIN ได้ตรง ๆ (ยืนยันด้วย exploit จริง: HTTP 200 role เปลี่ยน)
รวมถึง create-user / ban / delete ผู้ใช้คนอื่นได้ทั้งหมด — ขัด spec §3 (Users = SUPER_ADMIN only)

- **สาเหตุ:** endpoint `/api/auth/admin/*` **ไม่ได้ป้องกันด้วย proxy/layout** (เหมือน 7.2) — Better Auth เช็คเองจาก `adminRoles` + ac ของ role
  · การซ่อนเมนู (`superAdminOnly`) และ `requireRole("SUPER_ADMIN")` ที่ **หน้า** ไม่ช่วย เพราะ endpoint เป็นคนละชั้น
- **แก้ 2 จุด (ต้องทำคู่กัน):**
  1. `auth.ts` → `adminRoles: ["SUPER_ADMIN"]` (ถอด ADMIN ออกจากการเป็น "admin" ของ Better Auth)
  2. `permissions.ts` → `ADMIN = ac.newRole({})` (ไม่มีสิทธิ์ admin plugin เลย · ADMIN จัดการ *เนื้อหา* ผ่าน `canManageContent` ซึ่งไม่พึ่ง plugin นี้)
- **ยืนยันหลังแก้ (positive + negative control):** ADMIN ยิง set-role/create-user/list-users → **403** ทั้งหมด · SUPER_ADMIN ยิงชุดเดียวกัน → **200**
  ⇒ พิสูจน์ว่า lockdown ได้ผลและไม่ได้พังของเดิม
- 📌 **`authClient.admin.*` typing:** ต้องส่ง `adminClient({ ac, roles })` ใน `lib/auth-client.ts` ไม่งั้น type ของ `createUser`/`setRole`
  เป็น `"user" | "admin"` (default) แทน role จริงของโปรเจกต์ · Better Auth มี error code `YOU_CANNOT_BAN_YOURSELF` กัน self-ban ให้ระดับ server อยู่แล้ว (UI ยัง disable ปุ่มบนแถวตัวเองเป็น defense-in-depth)
  · *(content-type ของการยิง action ไม่เกี่ยว — `application/json` เข้า DB ได้ปกติ ตาม 7.2)*

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
- ✅ **อัปเดต 2026-07-19:** สีแบรนด์ + accent เป็น token หมดแล้ว → **อย่า hardcode hex ใน component อีก**
  - แบรนด์/นิวทรัล: ใช้ `bg-primary` `text-muted-foreground` `bg-card` `border-border` `bg-secondary` ฯลฯ (ดู `app/globals.css` `:root`)
  - accent เชิงข้อมูล (สถานะ/หมวด/ไอคอนสถิติ): `bg-mint-muted`/`text-mint-foreground`/`bg-mint` · `sky-*` · `warning-*`
  - Tailwind v4: token ตั้งใน `@theme inline` เป็น `--color-<ชื่อ>` แล้ว utility เกิดเอง (`--color-sky-muted` → `bg-sky-muted`) · ชื่อไม่มีเลขจึงไม่ชนพาเลต `sky-500` ดีฟอลต์ของ Tailwind

### 8.6 🔥 `next build` **ต้องมี DATABASE_URL ที่ต่อติดจริง** (พิสูจน์แล้ว 2026-07-23)

- หน้า public หลายหน้า (`/about` `/albums` `/calendar` `/contact` `/documents` `/staff` + `/og.png` `/sitemap.xml`)
  ถูก **prerender เป็น static ตอน build** → Next เรียก Prisma จริงระหว่าง build
- **ทดลองตรง ๆ:** `docker stop thaingam-postgres` แล้ว `pnpm build` →
  `Error occurred prerendering page "/about"` · `PrismaClientKnownRequestError ECONNREFUSED` · **exit 1**
  *(positive control: เปิด DB กลับมา build เดิมผ่าน 42/42 หน้า)*
- ⚠️ **มีผลกับแผน deploy (roadmap 4.8):** GitHub Actions ที่ `docker build` บน runner **ไม่มี DB** → build พังทันที
  ทางเลือก: (1) ให้ runner ต่อ DB ได้ (2) ยกหน้าที่ query DB เป็น dynamic (`force-dynamic`) (3) build ในเครือข่ายเดียวกับ DB บน VPS
- ไม่ใช่ของใหม่จาก Phase 4.7 — เป็นแบบนี้มาตั้งแต่มีหน้า public ที่ query DB (4.5/4.6) เพิ่งมาเจอตอนลองรัน build จริง

### 8.7 🐳 Docker + pnpm + Prisma — 3 กับดักที่เจอตอนทำ image (2026-07-23)

1. **`COPY --from=builder /app/node_modules/prisma` แล้วรันไม่ได้** → `MODULE_NOT_FOUND`
   pnpm เก็บของจริงไว้ใน `node_modules/.pnpm/…` แล้วทำ symlink → copy เฉพาะโฟลเดอร์เดียวได้แต่เปลือก
   ✅ แก้: stage แยก (`prisma-cli`) ลง CLI ใหม่ในโฟลเดอร์ของตัวเอง (`/opt/tools`) แล้ว copy ทั้งก้อน
   · อ่าน**เวอร์ชันที่ติดตั้งจริง** (`require('/app/node_modules/prisma/package.json').version`) ไม่ใช่ช่วง `^7.x` ใน `package.json` — ไม่งั้น CLI คนละรุ่นกับ client
2. **`pnpm add` ในโฟลเดอร์ใหม่ล้มด้วย `ERR_PNPM_IGNORED_BUILDS`** (prisma/esbuild ต้องรัน postinstall)
   ✅ ต้องมี `pnpm-workspace.yaml` ที่มี `allowBuilds:` ในโฟลเดอร์นั้นด้วย · และ **อย่าใช้ `pnpm init`** — มันเขียน
   `devEngines.packageManager: "^11.x"` ซึ่ง corepack ปฏิเสธ (`expected a semver version`) → เขียน `package.json` เองสั้น ๆ
3. **`prisma.config.ts` `import "dotenv/config"` แต่ `.next/standalone/node_modules` ไม่มี dotenv**
   (Next trace เฉพาะ dependency ที่แอปใช้จริง) → `migrate deploy` ล้ม
   ✅ แก้ที่ entrypoint: `export NODE_PATH=/opt/tools/node_modules`
4. 📌 **seed รันใน image ไม่ได้** — `prisma/seed.ts` `import "@/lib/auth"` = source จริง ซึ่ง standalone ไม่มี (มีแต่โค้ดที่ build แล้ว)
   ✅ ทำครั้งเดียวจากเครื่องผู้ดูแลผ่าน **SSH tunnel** เข้า Postgres ของ VPS แทน (docs/deploy.md §4)

### 8.8 🔥 build ผ่านบนเครื่อง แต่ล้มบน CI — `lib/generated/prisma` ถูก `.gitignore` (2026-07-25)

**อาการ:** GitHub Actions run แรกล้มที่ `RUN pnpm build` → `exit code: 1`
เปิด log เห็น `Module not found` ชี้ที่ `./lib/prisma.ts:2:1` (`import "@/lib/generated/prisma/client"`)
แต่ `docker build` บนเครื่องนักพัฒนา**ผ่านสบาย ๆ** แม้ใส่ `--no-cache`

**สาเหตุ:** `prisma generate` ออกไฟล์ที่ `lib/generated/prisma` ซึ่งอยู่ **นอก `node_modules`** และถูก `.gitignore` (บรรทัด 45)
- stage `builder` copy มาแค่ `COPY --from=deps /app/node_modules` → **ไม่ได้เอา `lib/generated` มาด้วย**
- บนเครื่องนักพัฒนามีโฟลเดอร์นั้นค้างอยู่ → `COPY . .` ลากติดเข้า image เลยกลบปัญหาไว้
- บน CI checkout สะอาด ไม่มีไฟล์ → พังทันที

**✅ แก้:** ใน stage `builder` เพิ่มบรรทัดนี้ **หลัง `COPY . .`** (ลำดับสำคัญ — ก่อนหน้าจะโดน `COPY . .` ทับ)
```dockerfile
COPY --from=deps /app/lib/generated ./lib/generated
```

**🎯 บทเรียนสำคัญกว่าตัวบั๊ก — `docker build` ในโฟลเดอร์โปรเจกต์ไม่ใช่ control ของ CI**
build context ดูดไฟล์ที่ **git ไม่ track** เข้าไปด้วย (`lib/generated/`, artifact อื่น ๆ) → ผ่านบนเครื่องแต่ไม่ได้แปลว่า CI จะผ่าน
ครั้งนี้เคยสรุปผิดไปแล้วรอบหนึ่งว่า "โค้ดไม่ผิด ปัญหาอยู่ที่ CI" เพราะ control ปนเปื้อน (ดู 7.3)
✅ **จำลอง CI ให้ตรงด้วย `git archive`** — ได้เฉพาะไฟล์ที่ track จริง เท่ากับที่ runner checkout เป๊ะ:
```bash
mkdir /tmp/ci-clean && git archive HEAD | tar -x -C /tmp/ci-clean
cd /tmp/ci-clean && docker build --build-arg ... .
```
รอบนี้ reproduce error ตัวเดียวกับ CI ได้ก่อน แล้วค่อยพิสูจน์ว่าตัวแก้ทำให้ผ่าน (negative → positive control ครบคู่)

**⚠️ กับดักเดียวกันจะโผล่อีกกับไฟล์อื่นที่ generate แล้ว gitignore ไว้** — ถ้าเพิ่ม codegen ตัวใหม่ อย่าลืมเช็คว่ามันเข้าไปถึง image ทาง stage ไหน
