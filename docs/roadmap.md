# 🗺️ Phase 4 Roadmap & Checklist — Thaingam-web

> แผนลงมือจริง แตกเป็น sub-phase ย่อย พร้อม checklist ตั้งแต่ตั้งโปรเจกต์ → ออกแบบหน้า → เว็บสมบูรณ์
> ใช้คู่กับ [`spec.md`](./spec.md) — ทำไล่ตามลำดับ ติ๊ก `[x]` เมื่อเสร็จแต่ละข้อ
>
> **สถานะ:** ⏸️ รอเจ้าของโปรเจกต์สั่งเริ่มแต่ละ sub-phase

---

## ✅ Checklist ก่อนเริ่ม (Prerequisites)

เตรียมให้พร้อมก่อน Phase 4.2 (Auth) เป็นต้นไป:

- [x] **PostgreSQL** — มี `DATABASE_URL` (PostgreSQL 16 ผ่าน Docker, port 5436)
- [x] ~~**Google OAuth**~~ — **ยกเลิก (2026-07-19)** เจ้าของไม่ต้องการ · ใช้ email/password อย่างเดียว
- [ ] **Email provider** (reset password) — เช่น Resend → `RESEND_API_KEY` + email ผู้ส่ง
- [x] **Cloudinary** — ตั้งค่าใน `.env` แล้ว (2026-07-17) · ใช้ **signed upload** ผ่าน `/api/sign-cloudinary-params`
      ⚠️ ต้องมี **`NEXT_PUBLIC_CLOUDINARY_API_KEY`** ด้วย (CldUploadWidget อ่านฝั่ง client) — `API_SECRET` ห้ามเป็น `NEXT_PUBLIC_` เด็ดขาด
- [x] **Better Auth secret** — `BETTER_AUTH_SECRET` (สุ่มแล้ว), `BETTER_AUTH_URL=http://localhost:4000`
      *(ต้องตรงกับ port ที่รันจริง — Windows จอง 3000 ไว้ → รันด้วย `PORT=4000 pnpm dev`)*
- [ ] ข้อมูลจริงเบื้องต้น: โลโก้โรงเรียน, ชื่อ/ที่อยู่/เบอร์/อีเมล, Google Map embed, social links

> รวม `.env` keys ทั้งหมดอยู่ท้ายเอกสาร (ภาคผนวก A)

---

## 🎨 Page Design Playbook (ใช้กับ "ทุกหน้า")

ทุกหน้า public/admin ให้ทำตาม 6 ขั้นนี้ เพื่อให้คุณภาพสม่ำเสมอ:

1. **Wireframe** — ร่าง layout คร่าว ๆ (sections + ลำดับ) ก่อนเขียนโค้ด
2. **Data contract** — กำหนดว่าหน้าดึงข้อมูลอะไร (Prisma query / Server Action) + type
3. **Component breakdown** — แตกเป็น component ย่อย (reuse ของเดิมก่อนสร้างใหม่)
4. **States ครบ 4** — `loading` (skeleton) · `empty` · `error` · `success` (มีข้อมูล)
5. **Responsive** — ทดสอบ mobile → tablet → desktop (mobile-first)
6. **A11y & polish** — alt text, focus ring, contrast, keyboard nav, meta/SEO

---

## Phase 4.0 — Project Setup & Foundation ✅

**เป้าหมาย:** โปรเจกต์รันได้ มีโครง + เครื่องมือครบ
**สถานะ:** เสร็จ — เหลือ Prettier + โครงโฟลเดอร์ ที่ตั้งใจเลื่อนแบบ just-in-time (ไม่ใช่งานค้าง) → พร้อมเข้า Phase 4.1

- [x] `pnpm create next-app@latest` (TypeScript, App Router, Tailwind v4, **ไม่มี `src/`** — โค้ดที่ root, alias `@/*` → `./*`)
- [x] ล้าง boilerplate, ตั้งค่า `tailwind` v4 (`globals.css` + tokens) — ลบ svg ใน `public/`, `page.tsx`/`layout.tsx` เป็น placeholder ไทย (ฟอนต์ Noto Sans Thai), `globals.css` มี theme tokens + dark mode + `tw-animate-css`
- [x] `pnpm dlx shadcn@latest init` (base color: neutral, CSS variables) — มี `components.json` (baseColor neutral, cssVariables), `lib/utils.ts`, `components/ui/button.tsx`
- [x] ติดตั้ง deps หลัก: `prisma @prisma/client better-auth zod react-hook-form @hookform/resolvers` — (`prisma` เป็น devDependency, อนุญาต build script ใน `pnpm-workspace.yaml`)
- [x] ติดตั้ง UI/feature deps (พื้นฐาน): `next-cloudinary`, `date-fns`, `lucide-react`
  > ⏭️ **เลื่อนไปติดตั้งตอนลงมือทำฟีเจอร์นั้นจริง** (ไม่ติดตั้งใน 4.0):
  > - Tiptap (`@tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image @tiptap/extension-youtube`) → ติดตั้งตอน **Phase 4.3** (RichTextEditor)
  > - FullCalendar (`@fullcalendar/react @fullcalendar/daygrid @fullcalendar/list @fullcalendar/interaction`) → ติดตั้งตอน **Phase 4.6** (หน้าปฏิทิน)
- [x] ตั้งค่า ESLint + `tsconfig` paths (`@/*`→`./*`) — *(Prettier ⏭️ เลื่อนแบบ just-in-time: เพิ่มตอน Phase 4.8 Polish หากต้องการ)*
- [~] สร้างโครงโฟลเดอร์ตาม spec — ⏭️ **เลื่อนแบบ just-in-time** สร้างโฟลเดอร์ตอนลงมือ phase ที่ใช้จริง (`app/admin`→4.3, `app/(public)`→4.5, `server/actions`/`hooks`/`types`→เมื่อมีไฟล์แรก) เพราะโฟลเดอร์เปล่า git ไม่ track
- [x] สร้าง `.env.example` + `.env` — `.env.example` commit เข้า repo (ยกเว้นใน `.gitignore`), `.env` ถูก ignore
- [x] ✅ verify: `PORT=4000 pnpm dev` เปิด `localhost:4000` ได้ — Next.js 16.2.10 (Turbopack) ตอบ `HTTP 200`

---

## Phase 4.1 — Database & Prisma

**เป้าหมาย:** ตารางครบใน DB + seed ข้อมูลตั้งต้น
**หมายเหตุ:** ใช้ **Prisma 7** — generator `prisma-client` (output `lib/generated/prisma`) + driver adapter `@prisma/adapter-pg`, config ที่ `prisma.config.ts`

- [x] ติดตั้ง Prisma deps: `-D prisma @types/pg tsx` + `@prisma/client @prisma/adapter-pg pg dotenv`
- [x] `pnpm prisma init` (generator `prisma-client` + `--output ../lib/generated/prisma`) → ได้ `prisma/schema.prisma` + `prisma.config.ts`
- [x] ตั้ง `DATABASE_URL` ใน `.env` (PostgreSQL 16 ผ่าน Docker, port 5436) — ทดสอบเชื่อมต่อผ่าน
- [~] **วาง schema แบบ incremental (just-in-time)** — วางเฉพาะ model ที่โค้ดโยงไปถึง ไม่วางทั้งก้อนรวดเดียว *(spec หัวข้อ 4 = target ปลายทาง)*
  - [x] **Auth models** (`User` `Session` `Account` `Verification` + enum `Role`) → migrate `init_auth` แล้ว *(relation ไป content ตัดออกก่อน จะเติมกลับตอนเพิ่ม model นั้น)*
  - [x] **`Category`/`Tag`/`News` + enum `PublishStatus`** → migrate แล้วตอน Phase 4.4.1
  - [ ] Content models ที่เหลือ (`MediaWork`/`Event`/`Staff`/`Page`/`SiteSetting`/... + enum `MediaType`) → เพิ่ม + `migrate dev` ตอนทำ CRUD/หน้าที่ใช้จริง (Phase 4.4.3+)
- [x] สร้าง `lib/prisma.ts` (singleton กัน hot-reload + `PrismaPg` adapter, import client จาก `@/lib/generated/prisma/client`) — ทดสอบ `prisma.user.count()` ผ่าน + เพิ่ม `postinstall: prisma generate` ใน `package.json`
- [~] เขียน `prisma/seed.ts` (incremental):
  - [x] SUPER_ADMIN คนแรก — สร้างผ่าน Better Auth internal API (`auth.$context`: hash scrypt + `internalAdapter`) เลี่ยง `nextCookies`; creds จาก `SEED_ADMIN_*` ใน `.env`
  - [x] **Category เริ่มต้น 5 หมวด** (upsert — รันซ้ำได้ ไม่ทับชื่อที่แอดมินแก้เอง) → เพิ่มตอน Phase 4.4.1
  - [~] SiteSetting / Page เริ่มต้น → **Page seed แล้ว** (3 หน้า `admission`/`regulations`/`curriculum`, DRAFT, Phase 4.4.10) · **SiteSetting** ยังรอ Phase 4.4.11
- [x] ตั้ง seed ใน **`prisma.config.ts`** (`migrations.seed = "tsx prisma/seed.ts"`) — Prisma 7 ไม่ใช้ `prisma.seed` ใน `package.json` แล้ว → `pnpm prisma db seed` รันได้
- [ ] ✅ verify: `pnpm prisma studio` เห็นตาราง + SUPER_ADMIN *(login endpoint ทดสอบผ่านแล้วใน 4.2)*

---

## Phase 4.2 — Authentication & RBAC (Better Auth)

**เป้าหมาย:** login/logout ได้ + กัน route หลังบ้าน
**⚠️ Next.js 16:** `middleware.ts` ถูกเปลี่ยนชื่อเป็น **`proxy.ts`** (ฟังก์ชัน `proxy`, default Node.js runtime) — docs แนะนำให้ proxy ทำแค่ optimistic check ส่วน authorization จริงเช็คซ้ำใน layout/Server Action
**ลำดับปรับใหม่:** ทำ email/password core ก่อน → reset email เลื่อนไปทำตอนมี credentials (just-in-time) · **Google OAuth ยกเลิกแล้ว (2026-07-19)**

**A. Core (email/password) — เสร็จแล้ว**
- [x] `BETTER_AUTH_SECRET` (สุ่ม) ใน `.env`
- [x] `lib/auth.ts` — Better Auth server: `prismaAdapter(prisma, {provider:"postgresql"})`, `emailAndPassword`, `admin` plugin (role map: `defaultRole TEACHER`, `adminRoles [SUPER_ADMIN,ADMIN]`), `nextCookies()` (ตัวสุดท้าย)
- [x] `lib/permissions.ts` — access-control (`createAccessControl` + roles `SUPER_ADMIN`/`ADMIN`/`TEACHER`) *(จำเป็นเพราะ custom role ต้องนิยามใน `roles`)*
- [x] `lib/auth-client.ts` — `createAuthClient` + `adminClient` (`signIn`/`signOut`/`signUp`/`useSession`)
- [x] `app/api/auth/[...all]/route.ts` — `toNextJsHandler(auth)`
- [x] ปรับ schema ให้ตรง Better Auth (`session.impersonatedBy` + index) → migrate `auth_admin_fields`
- [x] ✅ verify: login endpoint `/api/auth/sign-in/email` — รหัสถูก→200 + คืน `role:SUPER_ADMIN` + set session cookie, รหัสผิด→401

**B. RBAC + route guard — เสร็จแล้ว**
- [x] `lib/rbac.ts` — `getSession()`/`getCurrentUser()`/`requireAuth()`/`requireRole()`/`canPublish()`/`canManageUsers()` (ใช้ `auth.api.getSession`, `server-only`) *(requireRole role ไม่พอ → redirect `/` ก่อน; TODO เปลี่ยนเป็น `forbidden()` 403 เมื่อเปิด `experimental.authInterrupts`)*
- [x] **`proxy.ts`** *(ไม่ใช่ `middleware.ts`)* — `getSessionCookie` optimistic check, matcher `/admin/:path*`, ไม่มี cookie → เด้ง `/login?redirect=...`
- [x] หน้า `(auth)/login` — `(auth)/layout.tsx` + `login/page.tsx` (Suspense) + `login-form.tsx` (react-hook-form + **`standardSchemaResolver`** เพราะ zod v4) → `authClient.signIn.email`
- [x] `app/admin/page.tsx` placeholder (`requireRole`) + shadcn `input`/`label`/`card` — *(dashboard เต็มใน 4.3)*
- [x] ✅ verify: guest→`/admin`→307 `/login?redirect=%2Fadmin`; login→200; มี cookie→`/admin` 200 render role

**C. ปิดสมัครสมาชิกเอง — เสร็จแล้ว**
- [x] `emailAndPassword.disableSignUp: true` ใน `lib/auth.ts` — ปิด `POST /api/auth/sign-up/email`
      *(ก่อนหน้านี้เปิดอยู่ → ใครก็สมัครเป็น TEACHER แล้วเข้า `/admin` ได้ ขัดกับ spec §3)*
- [x] **ไม่ทำหน้า register** — SUPER_ADMIN สร้าง user ทั้งหมดผ่าน `/admin/users` (Phase 4.4.13)
      *(ตัดสินใจ 2026-07-16: ครูไม่โพสต์เนื้อหาเอง → ไม่ต้องมีทางสมัคร)*

**D. เลื่อนไปทำตอนมี credentials (just-in-time)**
- [x] ~~Google OAuth~~ — **ยกเลิก (2026-07-19)** เจ้าของไม่ต้องการ · ถอด TODO `socialProviders.google` ออกจาก `lib/auth.ts` + คีย์ `GOOGLE_*` ออกจาก `.env.example` แล้ว
- [ ] Reset password (Resend) — เพิ่ม `sendResetPassword` + หน้า `(auth)/forgot-password`, `(auth)/reset-password` เมื่อมี `RESEND_API_KEY`
- [ ] ✅ verify (เพิ่มเติม): reset password ส่งอีเมล

---

## Phase 4.3 — Admin Shell & Reusable Components

**เป้าหมาย:** โครงหลังบ้าน + ชุด component ที่ CRUD ทุกหน้าจะ reuse

- [x] ติดตั้ง shadcn เพิ่ม: `sheet` `dropdown-menu` `avatar` `separator` `skeleton` `sonner` `badge` `tooltip` `scroll-area`
      *(⚠️ shadcn รุ่นนี้ build บน **`@base-ui/react`** ไม่ใช่ Radix — ใช้ prop `render={<X/>}` แทน `asChild`)*
      > 🐛 **กับดักที่เจอมาแล้ว:** `<Button render={<Link/>}>` จะ error `"expected a native <button> because nativeButton is true"`
      > เพราะ Base UI default `nativeButton: true` → **ปุ่มที่เป็นลิงก์ต้องใส่ `nativeButton={false}` เสมอ**
      > (แล้วมันจะเติม `role="button"` + `tabindex="0"` ให้เอง) · ถ้า `render` เป็น `Button`/`<button>` จริง ไม่ต้องใส่
- [x] `app/admin/layout.tsx` — auth guard **`requireRole("SUPER_ADMIN","ADMIN")`** (TEACHER เข้าไม่ได้ตาม RBAC ใหม่) + `<Toaster/>` + `robots: noindex`
- [x] `components/admin/nav-items.ts` — **แหล่งความจริงเดียวของเมนู** ขึ้นครบตาม spec §5 แต่ `ready:false` = กดไม่ได้ + ป้าย "เร็ว ๆ นี้"
      *(พอทำแต่ละ module ใน 4.4 เสร็จ → เปลี่ยน `ready` เป็น `true` จุดเดียวจบ)* + `visibleNavGroups(role)` ซ่อน users/settings ถ้าไม่ใช่ SUPER_ADMIN
- [x] `components/admin/sidebar-nav.tsx` — active state ผ่าน `usePathname` (`/admin` match เป๊ะ กัน active ตลอด)
- [x] `components/admin/admin-shell.tsx` — desktop: sidebar ถาวร `w-64` · mobile: drawer (`sheet`) + topbar sticky
- [x] `components/admin/user-menu.tsx` — avatar + ชื่อ + role + logout (`signOut` → `router.replace("/login")` + `refresh()`)
- [x] `components/admin/page-header.tsx` (title + description + action) · `role-label.ts` (ชื่อ role ภาษาไทย)
- [x] `app/admin/page.tsx` — Dashboard: การ์ดสถิติ **จากข้อมูลจริงที่มี** (ผู้ใช้/ผู้ดูแล/ครู/กำลังใช้งาน) + ผู้ใช้ล่าสุด + `Suspense`/skeleton
- [x] Component กลางที่เหลือ — เลื่อนไปสร้างใน **4.4.1** ที่มี consumer จริงแล้ว ✅ *(ดูรายละเอียดใน 4.4.1)*
  - [x] ~~`DataTable`~~ → ทำเป็น `table-search` + `table-pagination` (ทำงานผ่าน URL `?q=&page=`) + ใช้ `ui/table` ตรง ๆ
        **เหตุผล:** search/sort/pagination ทำฝั่ง server ด้วย Prisma อยู่แล้ว การครอบเป็น DataTable generic ตัวเดียวจะกลายเป็น client state ซ้อนโดยไม่จำเป็น
        → ค่อยยกเป็น component กลางจริงตอน module ที่ 2–3 เห็น pattern ซ้ำชัดแล้ว
  - [x] `RichTextEditor` (Tiptap) · `ImageUpload` (Cloudinary + วาง URL) · `StatusBadge` · `ConfirmDialog` · `SubmitButton`
  - [ ] ~~`PublishToggle`~~ → รวมอยู่ใน `news-row-actions` (ปุ่มตา) แล้ว · `FormField` wrappers → ยังไม่จำเป็น ฟอร์มใช้ `Label`+`Input` ตรง ๆ อ่านง่ายกว่า
- [x] toast ด้วย `sonner` — `<Toaster/>` ต่อใน admin layout แล้ว *(pattern error จาก Server Action → 4.4.1 ตอนมี action แรก)*
- [x] 🐛 **แก้ `BETTER_AUTH_URL`** — เดิมเป็น `:3000` แต่ dev รันที่ `:4000` → endpoint ที่เช็ค CSRF (เช่น `admin/create-user`)
      ตอบ `403 INVALID_ORIGIN` *(sign-in ไม่โดนเลยไม่มีใครเจอ)* → แก้เป็น `:4000` ทั้ง `.env` + `.env.example` แล้ว
- [x] ✅ verify (typecheck + lint ผ่าน, ทดสอบผ่าน HTTP จริงบน `:4000`):
  - guest → `/admin` = **307** → `/login?redirect=%2Fadmin`
  - SUPER_ADMIN → `/admin` = **200**, เมนูครบ 14 รายการ, `aria-disabled` = 13 (ป้าย "เร็ว ๆ นี้"), `aria-current` = 1 (แดชบอร์ด active)
  - ADMIN → `/admin` = **200**, **ไม่เห็น** ผู้ใช้งาน/ตั้งค่าเว็บไซต์ ✅ เห็นข่าวสาร/แดชบอร์ด ✅
  - TEACHER → `/admin` = **307** → `/` (ถูกกันออกตาม RBAC ใหม่)
  - การ์ดสถิติขึ้นเลขจริงจาก DB (ทดสอบตอนมี 3 users → `3 / 2 / 1 / 2`)
  - `admin/create-user` (ทางเดียวที่จะมี user ใหม่หลังปิด sign-up) ใช้งานได้ role ถูกต้อง
  - drawer mobile (< 1024px) เปิด/ปิด ✅ · ปุ่ม logout → เด้ง `/login` ✅ *(เจ้าของทดสอบคลิกจริงแล้ว)*
  - 🐛 เจอตอนคลิกจริง: `<Button render={<Link/>}>` ขาด `nativeButton={false}` → แก้แล้ว *(curl จับไม่ได้เพราะเป็น React console warning ไม่ใช่ HTTP error)*

---

## Phase 4.4 — Admin CRUD Modules

**เป้าหมาย:** จัดการข้อมูลได้ครบทุกโมเดล

> ✅ **เก็บหนี้ session query ซ้ำแล้ว (2026-07-17)** — เดิม `layout.tsx` เรียก `requireRole()` และ `page.tsx` เรียกอีกที
> → ครอบ `getSession` ใน `lib/rbac.ts` ด้วย **`React.cache()`** (Next docs `02-guides/authentication.md` ใช้ pattern นี้กับไฟล์ DAL + `server-only` ตรง ๆ)
> **วัดจริงด้วย Postgres `log_statement=all`: session lookup 2→1, user lookup 2→1 ต่อ request** (ทั้ง `/admin` และ `/admin/news`) · guard ยังทำงาน (guest→307, admin→200)
> ⏭️ ยังเหลือทางเลือก **`session.cookieCache`** ของ Better Auth ถ้าอยากตัด DB hit ทิ้งทั้งหมด — ยังไม่เปิด ค่อยพิจารณาตอน 4.8 (perf)
> ⚠️ **Prisma 7 + driver adapter: `log: ['query']` ไม่ emit อะไรเลย** — จะดู query จริงต้องเปิด log ฝั่ง Postgres แทน
>    (`ALTER SYSTEM SET log_statement='all'` — สั่งทีละคำสั่ง ห้ามรวมใน `-c` เดียว ไม่งั้นติด transaction block) แล้ว `docker logs thaingam-postgres`
>    · PG log extended protocol เป็น `execute <unnamed>:` **ไม่ใช่** `statement:` และตารางขึ้นเป็น `"public"."session"` — grep ให้ตรง
**แต่ละ module ทำเป็นชุด:** `list (DataTable)` → `create form` → `edit form` → `delete` → `Server Actions + Zod` → `RBAC`

> กติกา RBAC: **ADMIN/SUPER_ADMIN จัดการเนื้อหาได้ทั้งหมด + publish** · **TEACHER ยังไม่มีสิทธิ์ในส่วนนี้**
> *(ตัดสินใจ 2026-07-16 — ครูไม่โพสต์เอง; TEACHER สงวนไว้ให้ส่วน "ข้อมูลภายในโรงเรียน" ในอนาคต ดู spec §3)*

- [x] **4.4.1 News** — cover(Cloudinary), category, tags, Tiptap, featured, publish flow ✅
  - [x] schema: `Category`/`Tag`/`News` + enum `PublishStatus` + `User.news` → migrate `add_news_category_tag`
        *(`authorId`/`categoryId` เป็น nullable + `onDelete: SetNull` — ลบ user/หมวดหมู่แล้วข่าวไม่หาย)*
  - [x] migrate `lowercase_content_tables` — เขียน SQL เอง (`ALTER TABLE ... RENAME`) เพราะ Prisma จะ drop+create ทำให้ข้อมูลหาย
  - [x] `prisma/seed.ts` — หมวดหมู่ตั้งต้น 5 รายการ (upsert, รันซ้ำได้)
  - [x] `lib/validations/news.ts` (Zod) — slug บังคับ `^[a-z0-9]+(-[a-z0-9]+)*$` · content เช็คว่าไม่ใช่แท็กเปล่า *(ทดสอบ 10/10 เคส)*
  - [x] `server/actions/news.ts` — create/update/delete/togglePublish gate ด้วย `canManageContent` ทุกตัว
        *(`publishedAt` ตั้งครั้งแรกที่ publish แล้วคงค่า — แก้ข่าวเก่าไม่ดันวันที่ใหม่)*
  - [x] `app/api/sign-cloudinary-params/route.ts` — signed upload (**ไม่ใช้ unsigned preset** ที่เปิดให้ใครก็อัปเข้าบัญชีได้) + กันสิทธิ์
  - [x] component กลาง *(เลื่อนมาจาก 4.3)*: `rich-text-editor` (Tiptap) · `image-upload` · `status-badge` · `confirm-dialog` · `submit-button` · `table-search` · `table-pagination`
  - [x] หน้า: `/admin/news` (list + ค้นหา + กรองสถานะ + pagination) · `/new` · `/[id]/edit` → เปิดเมนู `ready:true`
  - [x] ✅ verify: list/new = 200 · empty state ขึ้น · หมวดหมู่จาก seed ขึ้นในฟอร์ม · **API secret ไม่หลุดไป client**
        · signing endpoint: guest/TEACHER = **403**, ADMIN = 200 · CRUD + publish/unpublish + slug ซ้ำ + SetNull ผ่านครบ
  - [x] ✅ **ทดสอบคลิกจริงแล้ว (2026-07-17 — เจ้าของทดสอบเอง):** Tiptap (พิมพ์/toolbar/ลิงก์/รูป/YouTube/undo-redo) ·
        Cloudinary อัปขึ้นจริง · ปุ่มตา publish/unpublish พลิกเอง · ลบมี dialog ยืนยัน · edit โหลดเนื้อหาเดิมกลับครบ · slug ซ้ำขึ้น error ตรงช่อง
  > 🐛 **3 บั๊กที่เจอตอน verify (แก้แล้ว):**
  > 1. **`P2002` ไม่มี `meta.target`** เมื่อใช้ Prisma 7 + driver adapter → อยู่ที่ `meta.driverAdapterError.cause.constraint.fields` แทน
  >    ทำให้ slug ซ้ำตกไปเป็น error กว้าง ๆ แทนที่จะขึ้นตรงช่อง → `isUniqueSlugError()` อ่านทั้งสองที่แล้ว
  > 2. **StarterKit v3 รวม `extension-link` มาแล้ว** → ถอน `@tiptap/extension-link` ที่ลงแยกออก (ซ้ำ) config ผ่าน `StarterKit.configure({ link })` แทน
  > 3. **ปุ่มลิงก์ตอนไม่ได้เลือกข้อความ = เงียบสนิท** (เจอตอนคลิกจริง) — `setLink()` บน selection ว่างกลายเป็น **stored mark**
  >    (จำไว้ให้ตัวที่พิมพ์ถัดไป) ไม่แทรกอะไรบนจอ ดูเหมือนปุ่มเสีย → เช็ค `selection.empty && !isActive("link")` แล้ว `insertContent` URL เป็นข้อความที่มี link mark แทน
  > ⚠️ **`migrate deploy` ไม่ generate client ใหม่** (ต่างจาก `migrate dev`) — ถ้า rename ตาราง ต้อง `prisma generate` + **restart dev server** เอง
  > ⚠️ **lucide v1 ตัดไอคอนแบรนด์** (`Youtube`) ออกแล้ว → ใช้ `SquarePlay`
- [x] **4.4.2 Categories & Tags** — CRUD ทั้งคู่ในหน้าเดียว (`/admin/categories` ตามเมนู spec §5) ✅
  > ❌ **ยกเลิก "slug อัตโนมัติ" ที่เคยเขียนไว้ (ตัดสินใจ 2026-07-17)** — ชื่อหมวดหมู่เป็นภาษาไทย แต่ `slugSchema` บังคับ `a-z0-9-`
  > → auto-gen จากชื่อไทยได้ **string ว่าง** ใช้ไม่ได้จริง · slug ที่ต้องการคือ**คำแปลอังกฤษที่คนเลือกเอง**
  > (seed: `ข่าวประชาสัมพันธ์`→`announcements`, `จัดซื้อจัดจ้าง`→`procurement`) ไม่มีอัลกอริทึมไหนทำให้ได้
  > → **พิมพ์เองเหมือนข่าว** สม่ำเสมอทั้งระบบ *(ทางเลือกที่ทิ้งไป: ทับศัพท์ไทย→อังกฤษ ได้ `khao-prachasamphan` — อัตโนมัติจริงแต่ URL อ่านไม่รู้เรื่อง)*
  - [x] ไม่ต้อง migrate — `Category`/`Tag` วางไว้แล้วตั้งแต่ 4.4.1
  - [x] `lib/validations/slug.ts` — **ยก `slugSchema` ออกจาก `news.ts` เป็นของกลาง** (มีผู้ใช้ 2 รายแล้ว)
  - [x] `lib/prisma-errors.ts` — **ยก `isUniqueSlugError()` ออกจาก `server/actions/news.ts`** + ทำเป็น `isUniqueError(error, field)` ทั่วไป (กับดัก P2002 ของ Prisma 7 อยู่ที่เดียวจบ)
  - [x] `server/actions/types.ts` — ย้าย `ActionResult` มาไว้กลาง (ไฟล์ `"use server"` export ได้แต่ async function → type ต้องอยู่นอก · และ taxonomy ไม่ต้อง import ข้ามไปหา news)
  - [x] `lib/validations/taxonomy.ts` · `server/actions/taxonomy.ts` — create/update/delete × category/tag gate ด้วย `canManageContent` ทุกตัว
  - [x] component: `taxonomy-dialog` (ฟอร์มใน dialog ใช้ร่วมกัน 2 kind — มีแค่ 2–3 ช่อง ไม่คุ้มเปลี่ยนหน้าแบบฟอร์มข่าว) · `taxonomy-row-actions` · `taxonomy-add-button` · shadcn `dialog` (เพิ่มใหม่ เดิมมีแค่ `alert-dialog`)
  - [x] ลบแล้วข่าวไม่หาย + **บอกผลให้ชัดใน dialog ยืนยัน**: หมวดหมู่ → ข่าวกลายเป็น "ไม่มีหมวดหมู่" (`SetNull`) · แท็ก → ข่าวถูกถอดแท็กออก (m-n)
  - [x] เปิดเมนู `ready:true`
  - [x] ✅ verify: guest→307 · SUPER_ADMIN/ADMIN→200 เห็นปุ่มจัดการ · **TEACHER→307 `/`** · หมวดหมู่ seed ขึ้นครบ 5 · empty state แท็กขึ้น
        · **แท็กที่เพิ่ม โผล่ในฟอร์มข่าวทันที** (แทรก DB → ฟอร์มเห็น) · ล้างข้อมูลทดสอบกลับสภาพเดิมแล้ว
  - [x] 🔒 **ทดสอบ Server Action โดยตรง** (ข้าม UI — ดึง action id จาก `.next/dev/server/app/admin/categories/page/server-reference-manifest.json`
        แล้ว POST `Next-Action: <id>`): **TEACHER โดนปฏิเสธทั้ง 6 action** + ไม่มีอะไรเข้า DB
        · **positive control:** ADMIN ยิง request รูปแบบเดียวกันเป๊ะ → `"ok":true` สร้างได้จริง
        ⇒ พิสูจน์ว่าที่ TEACHER ถูกบล็อกคือ **RBAC** ไม่ใช่ request ผิดรูป *(ไม่มี control ข้อนี้ = สรุปไม่ได้)*
  - [ ] ⏸️ **ยังไม่ได้ทดสอบคลิกจริง:** เพิ่ม/แก้/ลบ ผ่าน dialog, กดแก้รายการอื่นต่อกันดูค่าค้าง, toast
- [x] **4.4.3 MediaWork** — type (YOUTUBE/VIDEO/ARTICLE) เปลี่ยน field ตาม type, validate youtubeUrl ✅
  - [x] schema: `MediaWork` + enum `MediaType` + `User.mediaWorks` + `Tag.mediaWorks` → migrate `add_media_work`
        *(`authorId` nullable + `SetNull` — คลายจาก spec ให้ตรงกับ News · ตรวจ SQL แล้วไม่มี `DROP` ข้อมูลเดิมอยู่ครบ · join table = `_MediaWorkToTag`)*
  - [x] `lib/youtube.ts` — `extractYoutubeId()` รองรับ watch/youtu.be/embed/shorts/live/m./nocookie + `youtubeEmbedUrl()`/`youtubeThumbnailUrl()` *(4.6 จะ reuse ตอนฝังวิดีโอ)*
  - [x] `lib/validations/media-work.ts` — **object แบน + `superRefine`** ไม่ใช้ discriminated union
        *(RHF ต้องการชุด field คงที่ ไม่งั้นค่าที่กรอกหายตอนสลับชนิด)* — บังคับเฉพาะ field ของชนิดที่เลือก
  - [x] `server/actions/media-work.ts` — create/update/delete/togglePublish gate ด้วย `canManageContent` ทุกตัว
        · **`pickTypeFields()` ล้าง field ของชนิดอื่นเป็น null ตอนบันทึก** (ไม่งั้นสลับชนิดแล้วข้อมูลเก่าค้าง หน้า public เดาไม่ออกว่าจะแสดงอะไร)
  - [x] `lib/media-work.ts` — `mediaWorkThumbnail()` **derive รูปปก YouTube ตอนแสดงผล ไม่เก็บลง DB** (ดูบั๊กด้านล่าง) · ใช้แล้วในคอลัมน์รูปปกของตาราง
  - [x] หน้า: `/admin/works` (ค้นหา + กรองสถานะ + **กรองชนิด** + pagination + คอลัมน์รูปปก) · `/new` · `/[id]/edit` → เปิดเมนู `ready:true`
  - [x] ✅ verify: guest→307 · SUPER_ADMIN→200 · **TEACHER→307 `/` + ยิง action ตรงถูกปฏิเสธ ไม่มีอะไรเข้า DB**
        *(positive control: action id เดียวกัน + SUPER_ADMIN → `"ok":true` สร้างได้จริง)*
        · **`extractYoutubeId` ทดสอบ 19/19 เคส** (รวม `javascript:alert(1)`, vimeo, id สั้นเกิน → null)
        · ลิงก์ไม่ใช่ YouTube → `ข้อมูลไม่ถูกต้อง` ไม่มี record หลุดเข้า DB
        · สลับ YOUTUBE→ARTICLE → `youtubeUrl` เป็น NULL, `content` ถูกเซ็ต ✅ · ล้างข้อมูลทดสอบแล้ว
  - [x] ✅ **ทดสอบคลิกจริงแล้ว (2026-07-17 — เจ้าของทดสอบเอง):** สลับชนิดแล้วช่องเปลี่ยนตาม ·
        **สลับไปมาแล้วค่าที่พิมพ์ไว้ยังอยู่** (ยืนยันว่าเลือก flat object + superRefine ถูกแล้ว) ·
        Tiptap ในโหมดบทความ · สร้างคลิปโดยไม่อัปรูปปก → ตารางขึ้นรูปปกคลิปให้เอง ·
        ลิงก์ vimeo ในช่อง YouTube → error ขึ้นตรงช่อง · ปุ่มตา/ลบ/แก้ไข + กรองชนิด
  > 🐛 **บั๊กที่เจอตอน verify (แก้แล้ว) — รูปปก YouTube ค้างคลิปเก่า:**
  > เดิม derive รูปปกจากคลิปแล้ว**เก็บลง DB** → พอเปิดหน้าแก้ไข ฟอร์มโหลดค่านั้นกลับมาเป็นค่าในช่อง
  > → กลายเป็น "ค่าที่แอดมินตั้งเอง" แยกไม่ออก → **เปลี่ยนลิงก์คลิปทีหลัง รูปปกยังชี้คลิปเก่าเงียบ ๆ** (พิสูจน์แล้วว่าเกิดจริง)
  > → แก้: `thumbnail` ใน DB = เฉพาะที่แอดมินตั้งเอง (null = ยังไม่ตั้ง) · รูปปกอัตโนมัติคำนวณตอนแสดงผล
  > ⚠️ **`migrate dev` ไม่ generate client** (เข้าใจผิดมาก่อน — ดู `problems.md` 3.1) → `prisma.mediaWork` ไม่มี ต้อง `prisma generate` + **restart dev server**
  >    *(ตอน verify เจอ 500 เพราะ dev server ตัวเก่ายังรันค้างที่ :4000 ถือ client เก่าไว้ — ตัวใหม่ start ไม่ขึ้นเงียบ ๆ ด้วย `EADDRINUSE`)*
- [x] **4.4.4 Events** — date range (multi-day), allDay, color picker, location ✅
  - [x] schema: `Event` + `User.events` → migrate `add_event`
        *(`authorId` nullable + `SetNull` — คลายจาก spec ให้ตรงกับ News/MediaWork · ไม่มี slug/tags/featured · `status` default `PUBLISHED`)*
  - [x] `lib/event.ts` — date helpers **จัดการ timezone เอง** (pure, ไม่มี `server-only` เพราะ validation ฝั่ง client import)
        · `parseEventDateInput`/`eventDateInputValue` (round-trip date↔string) · `formatEventRange` (ช่วงเวลาไทย reuse ได้ที่ปฏิทิน 4.6)
  - [x] `lib/validations/event.ts` (Zod) — object แบน + `superRefine` เช็ค `endDate >= startDate` · `EVENT_COLOR_PRESETS` (hex 7 สี)
  - [x] `server/actions/event.ts` — create/update/delete/togglePublish gate ด้วย `canManageContent` ทุกตัว · แปลง string→Date ตอนบันทึก
  - [x] component: `event-form` (allDay switch สลับ `<input date>`↔`<input datetime-local>` + normalize ค่า · color picker preset+custom · cover) · `event-row-actions`
  - [x] หน้า: `/admin/events` (ค้นหา + กรองสถานะ + pagination + จุดสีในตาราง) · `/new` · `/[id]/edit` → เปิดเมนู `ready:true`
  - [x] ✅ verify (typecheck + lint ผ่าน, ทดสอบ HTTP จริงบน `:4000`):
        guest→307 `/login` · **SUPER_ADMIN→200** list/new/edit · **TEACHER→307 `/` + ยิง action ตรงถูกปฏิเสธ (`ไม่มีสิทธิ์`) ไม่มีอะไรเข้า DB**
        *(positive control: action id + payload เดียวกันเป๊ะ + SUPER_ADMIN → `ok:true` สร้างได้จริง)*
        · **date helper ทดสอบ 15 เคส** (round-trip timed/allDay, ไม่เพี้ยนวันข้าม timezone, end<start ตรวจจับ, formatEventRange 4 รูปแบบ)
        · **allDay multi-day → DB เก็บเป็น UTC ของเที่ยงคืนท้องถิ่นถูกต้อง** (`2026-08-01` local → `2026-07-31 17:00 UTC`) · edit โหลดกลับ round-trip ตรง · ล้างข้อมูลทดสอบแล้ว
  - [x] ✅ **ทดสอบคลิกจริงแล้ว (เจ้าของทดสอบเอง — ยืนยันครบหลังแก้บั๊ก):** บันทึก/แก้ไข/ลบ · focus นิ่งตอนกรอก · อัปโหลด auto-open · toggle ทั้งวันแล้ววันไม่หาย
  > 🐛 **บั๊กที่ 1 (แก้แล้ว, ยืนยันแล้ว) — เคอร์เซอร์หลุดตอนกรอกฟอร์ม:**
  >    `CldUploadWidget` โหลด `all.js` ทันทีที่ mount แล้วฉีด iframe เข้า DOM → แย่ง focus จากช่องที่กำลังพิมพ์
  >    → แก้ที่ `image-upload.tsx` ให้ **lazy mount** widget เฉพาะตอนกด "อัปโหลด" (มีผลกับฟอร์ม news/works ด้วย) · problems.md 5.4
  > 🐛 **บั๊กที่ 2 (แก้แล้ว, ยืนยันแล้ว) — toggle "ทั้งวัน" แล้ววันที่หาย:** เปลี่ยน `type` บน `<input>` เดิม (datetime-local↔date)
  >    เบราว์เซอร์ล้างค่าที่ไม่ตรง type + ยิง `onChange("")` ทับ → แก้ด้วย `key` remount input · problems.md 5.5
  > 📝 **ปีในตารางแสดงเป็น ค.ศ. 2 หลัก** (`d MMM yy` locale `th` → "1 ส.ค. 26" ไม่ใช่ พ.ศ. 69) — **ตรงกับ news/works ทั้งแอป** (ไม่ใช่บั๊ก)
  >    ถ้าจะเปลี่ยนเป็น พ.ศ. ต้องทำพร้อมกันทั้งเว็บ → ยกไปพิจารณารวมที่ Phase 4.8
  > 🐛 **Windows: dev server EPERM rename `.next/dev/...manifest.js`** (เจอตอน start เซิร์ฟหลัง generate) → หน้าเป็น 500 ทุกอัน
  >    แก้: kill process พอร์ต 4000 + `rm -rf .next` แล้ว `pnpm dev` ใหม่ → หายสนิท (ดู problems.md 2.4)
- [x] **4.4.5 Staff** — ทำเนียบบุคลากร + รูป + order (หมายเลข) + isActive ✅
  - [x] schema: `Staff` (+ `@@index([order])`, `@@map("staff")`) → migrate `add_staff`
        *(ไม่มี publish/slug/tags/author — เป็นข้อมูลคงที่ · `isActive` = แสดง/ซ่อนหน้าเว็บ แทน DRAFT/PUBLISHED)*
  - [x] `lib/validations/staff.ts` (Zod) — object แบน · `order` เก็บเป็น **string** จาก `<input number>` (regex `^\d+$`) แล้ว coerce เป็น number ตอนบันทึกใน action *(เหตุผลเดียวกับวันที่ใน event — RHF คุม string ง่ายกว่า, เลี่ยง `z.coerce` ที่ทำ input type เป็น `unknown`)*
  - [x] `server/actions/staff.ts` — create/update/delete/**toggleStaffActive** gate ด้วย `canManageContent` ทุกตัว (บทบาท toggle = แสดง/ซ่อน)
  - [x] component: `staff-form` (2 คอลัมน์: ข้อมูล + การแสดงผล/รูป · Switch แสดงบนเว็บ · ช่องลำดับ) · `staff-row-actions` (ตา=ซ่อน/แสดง, แก้ไข, ลบ)
  - [x] หน้า: `/admin/staff` (ค้นหา ชื่อ/ตำแหน่ง/ฝ่าย + กรองแสดง/ซ่อน + pagination + รูปวงกลม + คอลัมน์ลำดับ · เรียง `order asc, name asc`) · `/new` (แนะนำลำดับถัดไป max+1) · `/[id]/edit` → เปิดเมนู `ready:true`
  - [x] ✅ verify (typecheck + lint ผ่าน, ทดสอบ HTTP จริงบน `:4000`):
        guest→307 `/login` (list+new) · **SUPER_ADMIN→200** list/new/edit · **TEACHER→307 `/`**
        · 🔒 **ยิง action ตรง** (`Next-Action` id จาก manifest): TEACHER (มี session ผ่าน proxy) เรียก `createStaff` → `ไม่มีสิทธิ์ทำรายการนี้` ไม่มีอะไรเข้า DB
        **positive control:** action id + payload เดียวกันเป๊ะ + SUPER_ADMIN → `ok:true` สร้างได้จริง ⇒ พิสูจน์ว่าที่บล็อกคือ RBAC ไม่ใช่ payload ผิดรูป
        · **CRUD ครบผ่าน action จริง:** create (order `"5"`→`5`, isActive `true`, department set ถูก) · list render row · edit=200 · **toggle: isActive true→false** · delete: ลบ row จริง (count→0) + เรียก toggle บน row ที่ลบแล้ว → `ไม่พบบุคลากรนี้` (กัน not-found ถูก) · ล้างข้อมูลทดสอบ + temp TEACHER แล้ว
  - [x] ✅ **ทดสอบคลิกจริงแล้ว (เจ้าของทดสอบเอง):** เพิ่ม/แก้/ลบ ผ่านฟอร์ม, อัปโหลดรูป, toggle แสดง/ซ่อนจากปุ่มตา, ช่องลำดับ, empty state
  > 🐛 **แถม (เจ้าของเจอตอนทดสอบ):** วางลิงก์ Google Drive แล้วรูปไม่ขึ้น — ไม่ใช่บั๊กโค้ด (ลิงก์เด้งไปหน้า login Google, คืน HTML ไม่ใช่รูป)
  >    → เพิ่ม `onError` ใน `image-upload.tsx` โชว์กล่อง "โหลดรูปไม่สำเร็จ..." แทนที่จะเงียบ (มีผลทุกฟอร์ม news/works/events/staff) · ดู problems.md 5.6
- [x] **4.4.6 Albums & Photos** — album + upload หลายรูป + จัดลำดับ + ดู likeCount ✅
  - [x] schema: `Album` + `Photo` (+ `User.albums`) → migrate `add_album_photo`
        *(Album: slug ตั้งเอง, `eventDate` ระดับวัน, `status`, `likeCount` denormalized (แอดมินดูอย่างเดียว), `authorId?`+SetNull · Photo: `onDelete: Cascade`, `order`, `@@index([albumId, order])`)*
        > ⏭️ **`AlbumLike` เลื่อนไป Phase 4.6** (ปุ่มไลก์สาธารณะ + fingerprint) — `Album.likes` relation จะเติมกลับตอนนั้น · ตอนนี้เก็บแค่ field `likeCount`
  - [x] `lib/validations/album.ts` — `albumFormSchema` (reuse `slugSchema`) · `photoCaptionSchema` · `eventDate` เป็น string แล้วแปลงด้วย `parseEventDateInput(_, true)` (reuse จาก `lib/event.ts` — วันไม่เพี้ยนข้าม timezone)
  - [x] `server/actions/album.ts` — **album:** create/update/delete/toggleAlbumPublish (slug ซ้ำ → `isUniqueError`) · **photo:** `addPhotos` (เพิ่มหลายใบ order ต่อท้าย), `updatePhotoCaption`, `deletePhoto`, `movePhoto` (swap order กับใบข้างเคียงใน transaction) — gate ด้วย `canManageContent` ทุกตัว
  - [x] component: `album-form` (สร้างเสร็จ→เด้งหน้าแก้ไขเพื่อเพิ่มรูป เพราะ Photo ต้องมี albumId ก่อน) · `album-row-actions` · **`album-photos-manager`** (multi-upload Cloudinary lazy-mount + flush ตอน `onQueuesEnd` · caption inline (blur) · ปุ่มขึ้น/ลง · ลบ+ยืนยัน)
  - [x] หน้า: `/admin/albums` (ค้นหา + กรองสถานะ + pagination + รูปปก (fallback รูปแรก) + จำนวนรูป + likeCount + วันจัด) · `/new` · `/[id]/edit` (ฟอร์ม + ตัวจัดการรูป) → เปิดเมนู `ready:true`
  - [x] ✅ verify (typecheck + lint ผ่าน, ทดสอบ HTTP จริงบน `:4000`):
        guest→307 `/login` · **SUPER_ADMIN→200** list/new/edit · **TEACHER→307 `/` + ยิง `createAlbum`/`addPhotos` ตรงถูกปฏิเสธ (`ไม่มีสิทธิ์`) ไม่มีอะไรเข้า DB**
        *(positive control: action id + payload เดียวกันเป๊ะ + SUPER_ADMIN → `ok:true`)*
        · **slug ซ้ำ → `fieldErrors.slug`** (isUniqueError ทำงานกับ Prisma 7 adapter) · **eventDate `2026-08-01` local → เก็บ `2026-07-31T17:00Z`** (ระดับวัน ไม่เพี้ยน)
        · **CRUD รูปครบผ่าน action จริง:** addPhotos 2 ใบ (order 0,1) · movePhoto down → สลับ order ถูก · updatePhotoCaption · deletePhoto · **deleteAlbum → Cascade ลบรูปหมด (orphan photos = 0)** · toggle PUBLISHED→DRAFT · ล้างข้อมูล + temp TEACHER แล้ว
  - [x] ✅ **ทดสอบคลิกจริงแล้ว (เจ้าของทดสอบเอง):** สร้างอัลบั้ม→เด้งหน้าแก้ไข, อัปโหลดหลายรูปพร้อมกันขึ้น Cloudinary จริง, แก้ caption, ปุ่มขึ้น/ลงจัดลำดับ, ลบรูป/ลบอัลบั้ม, empty state
- [x] **4.4.7 Documents** — ศูนย์ดาวน์โหลด + fileUrl + หมวด ✅
  - [x] schema: `Document` (status `PublishStatus` default PUBLISHED · `category` free text · `downloadCount` denormalized · `fileType` ว่างได้ เดาตอนแสดงผล) → migrate `add_document` (additive ล้วน)
  - [x] `lib/document.ts` — `documentFileLabel()`/`extFromUrl()` **เดาชนิดไฟล์จาก URL ตอนแสดงผล ไม่เก็บลง DB** (หลักการเดียวกับรูปปก YouTube · problems.md 8.3) · pure ไม่มี server-only
  - [x] `lib/validations/document.ts` — object แบน · `fileUrl` บังคับเป็น URL · `published` เป็น boolean (Switch) แล้ว map → `status` ตอนบันทึก
  - [x] `server/actions/document.ts` — create/update/delete/**toggleDocumentPublish** gate `canManageContent` ทุกตัว (คัดลอกแพตเทิร์น staff/news)
  - [x] component: `file-upload` (Cloudinary `resourceType:auto` + วาง URL · lazy-mount กัน focus theft · แสดงเป็นชิปไฟล์ไม่ใช่รูป) · `document-form` (หมวดมี datalist แนะนำ) · `document-row-actions` (ตา=publish/unpublish, แก้, ลบ)
  - [x] หน้า: `/admin/documents` (ค้นหา ชื่อ/รายละเอียด/หมวด + กรองสถานะ + pagination + คอลัมน์ชนิดไฟล์/ดาวน์โหลด) · `/new` · `/[id]/edit` → เปิดเมนู `ready:true`
  - [x] ✅ verify (typecheck + lint ผ่าน · ทดสอบ HTTP จริงบน `:4000`):
        guest→307 `/login` · **SUPER_ADMIN→200** list/new/edit · edit ของที่ไม่มี→404 · empty state ขึ้น
        · **แทรก 2 แถวจริง (psql):** ตารางแสดง PDF (เดาจาก `.pdf`) + DOCX (แอดมินตั้งเอง) · badge หมวด · downloadCount 5 · **กรอง `status=DRAFT` โชว์เฉพาะร่าง (published ถูกซ่อน — positive+control)** · ล้างข้อมูลทดสอบแล้ว (0 แถว)
  - [ ] ⏸️ **ยังไม่ได้ทดสอบคลิกจริง:** อัปโหลดไฟล์ขึ้น Cloudinary (raw), ฟอร์มพรีฟิลตอนแก้ไข (RHF เติมค่าฝั่ง client), toggle/ลบผ่านปุ่ม, RBAC ยิง action ตรง (แพตเทิร์นเดียวกับ staff/news ที่พิสูจน์แล้ว)
- [x] **4.4.8 Banners** — Hero slider (order, isActive, link) ✅
  - [x] schema: `Banner` (image บังคับ · title/linkUrl ไม่บังคับ · `@@index([order, isActive])`) → migrate `add_banner` (additive)
  - [x] `lib/validations/banner.ts` — object แบน · image เป็น URL บังคับ · order string→number (เหมือน staff) · `.or(z.literal(""))` กับช่องไม่บังคับ
  - [x] `server/actions/banner.ts` — create/update/delete/**toggleBannerActive** gate `canManageContent` · revalidate `/admin/banners` + `/` (Hero หน้าแรก)
  - [x] component: `banner-form` (ImageUpload + title/linkUrl ไม่บังคับ + Switch แสดงบนหน้าแรก + ลำดับ) · `banner-row-actions` (ตา=แสดง/ซ่อน, แก้, ลบ)
  - [x] หน้า: `/admin/banners` (ค้นหาชื่อ + กรองแสดง/ซ่อน + pagination + thumbnail + คอลัมน์ลิงก์ · เรียง order asc) · `/new` (แนะนำลำดับ max+1) · `/[id]/edit` → เปิดเมนู `ready:true`
  - [x] ✅ verify (typecheck + lint ผ่าน · HTTP จริงบน `:4000`): guest→307 · SUPER_ADMIN→200 list/new · empty state
        · **แทรก 2 แถวจริง (psql):** ตารางโชว์ thumbnail + แบนเนอร์มีชื่อ/ไม่มีชื่อ (“ภาพไม่มีชื่อ”) + badge แสดง/ซ่อน · **กรอง `active=0` โชว์เฉพาะที่ซ่อน (แสดงอยู่ถูกซ่อน — positive+control)** · ล้างข้อมูลแล้ว
  - [ ] ⏸️ **ยังไม่ได้ทดสอบคลิกจริง:** อัปโหลดรูป, ฟอร์มพรีฟิลตอนแก้ไข, toggle/ลบผ่านปุ่ม, RBAC ยิง action ตรง (แพตเทิร์นเดียวกับ staff ที่พิสูจน์แล้ว)
- [x] **4.4.9 Announcements** — แถบประกาศด่วน (active, ช่วงเวลา startsAt/endsAt) ✅
  - [x] schema: `Announcement` (message บังคับ · linkUrl/startsAt/endsAt ไม่บังคับ · `isActive` · `@@index([isActive, startsAt, endsAt])` · เพิ่ม `updatedAt` จาก spec เพื่อความสม่ำเสมอ) → migrate `add_announcement` (additive ล้วน)
  - [x] `lib/announcement.ts` — `announcementLiveState()` (hidden/scheduled/live/expired เทียบเวลาปัจจุบัน) · `formatAnnouncementWindow()` (ช่วงเวลาไทย) · pure ไม่มี server-only
  - [x] `lib/validations/announcement.ts` — object แบน · วันที่เป็น string จาก `<input datetime-local>` (reuse `parseEventDateInput` จาก lib/event) · `superRefine`: endsAt ≥ startsAt
  - [x] `server/actions/announcement.ts` — create/update/delete/**toggleAnnouncementActive** gate `canManageContent` ทุกตัว · revalidate `/admin/announcements` + `/` (แถบหน้าแรก Phase 4.5) · string→Date ตอนบันทึก
  - [x] component: `announcement-form` (Textarea ข้อความ + linkUrl + 2×datetime-local ช่วงเวลา + Switch เปิด/ปิด) · `announcement-row-actions` (ตา=เปิด/ปิด, แก้, ลบ)
  - [x] หน้า: `/admin/announcements` (ค้นหาข้อความ + กรองเปิด/ปิด + pagination + **คอลัมน์สถานะคำนวณตามช่วงเวลา** กำลังแสดง/รอถึงเวลา/หมดเวลา/ปิดอยู่) · `/new` · `/[id]/edit` → เปิดเมนู `ready:true`
  - [x] ✅ verify (typecheck + lint ผ่าน · HTTP จริงบน `:4000`): guest→307 `/login` (list+new) · **SUPER_ADMIN→200** list/new · edit ที่ไม่มี→404 · empty state ขึ้น
        · **แทรก 4 แถวจริง (psql):** สถานะคำนวณถูกครบ 4 แบบ (live ไม่จำกัดเวลา / scheduled อนาคต / expired อดีต / hidden ปิด) · `formatAnnouncementWindow` โชว์ช่วงเวลา · **กรอง active=1 ซ่อนแถวปิด · active=0 โชว์เฉพาะแถวปิด (positive+control ด้วยข้อความ row ที่ unique เลี่ยงชนป้ายปุ่ม)** · ล้างข้อมูลแล้ว (0 แถว)
        · 🔒 **ยิง `createAnnouncement` ตรง** (Next-Action id จาก manifest): **TEACHER → `ไม่มีสิทธิ์ทำรายการนี้` (message token ASCII `NEGCTRL-…` → 0 แถวใน DB)** · **positive control: SUPER_ADMIN + request เหมือนกันเป๊ะ (token ASCII `POSCTRL-…` → 1 แถวใน DB)** ⇒ พิสูจน์ว่าที่บล็อกคือ RBAC ไม่ใช่ payload ผิดรูป · ล้าง temp TEACHER แล้ว
  > 🐛 **กับดักที่เสียเวลา ~15 นาที — Thai `LIKE` ผ่าน `docker exec -i psql` คืน 0 ทั้งที่มีแถวจริง** (client_encoding เพี้ยนผ่าน tty)
  >    ตอนแรกยืนยัน positive control ด้วย `LIKE 'ยิงตรงจาก%'` ได้ 0 เลยหลงคิดว่า action ไม่เข้า DB — ที่จริง**เข้าแล้ว** (เจอเป็นแถวค้างตอนเก็บกวาด)
  >    → **verify ด้วย token ASCII เสมอ** (`POSCTRL-…`/`NEGCTRL-…`) ไม่งั้นแยก "0 จริง" กับ "0 เพราะ encoding" ไม่ออก · ลบข้อมูลไทยให้ลบด้วย `id` (ASCII)
  >    *(หมายเหตุ: `Content-Type: application/json` ยิง action เข้า DB ได้ปกติ — ตรงกับ problems.md 7.2 · ไม่ใช่สาเหตุของ 0 แถว)*
  - [ ] ⏸️ **ยังไม่ได้ทดสอบคลิกจริง:** เพิ่ม/แก้/ลบผ่านฟอร์ม, ฟอร์มพรีฟิลตอนแก้ไข (RHF เติมค่า datetime ฝั่ง client — curl มองไม่เห็น), toggle เปิด/ปิดผ่านปุ่มตา, toast
- [x] **4.4.10 Pages** — แก้เนื้อหา rich text หน้า DB (ระเบียบ/หลักสูตร/รับสมัคร) ✅
  - [x] schema: `Page` (slug ตั้งเอง unique · title · content rich text · status · `authorId?`+SetNull · `@@index([status])`) + คืน `User.pages` relation → migrate `add_page` (additive)
        *(spec §4 มี `author User?` ไม่ระบุ onDelete → คลายเป็น SetNull ให้ตรงกับ News/MediaWork/Event/Album)*
  - [x] `prisma/seed.ts` — **หน้าตั้งต้น 3 หน้า** (`admission`/`regulations`/`curriculum`) upsert idempotent เป็น **DRAFT + placeholder** ให้แอดมินเข้าไปแก้ · slug ตรงกับ route หน้า public (Phase 4.6: `/admission` + `/[slug]`) → ติ๊กหนี้ seed Page ใน 4.1
  - [x] `lib/validations/page.ts` — reuse `slugSchema` · content เช็คไม่ใช่แท็กเปล่า (เหมือน News) · ไม่มี cover/category/tags/featured
  - [x] `server/actions/page.ts` — create/update/delete/**togglePagePublish** gate `canManageContent` ทุกตัว · slug ซ้ำ → `isUniqueSlugError` · revalidate `/admin/pages` + `/[slug]`
  - [x] component: `page-form` (title + slug + RichTextEditor + สถานะ) · `page-row-actions` (ตา=เผยแพร่/ร่าง, แก้, ลบ)
  - [x] หน้า: `/admin/pages` (ค้นหาชื่อ + กรองสถานะ + pagination + StatusBadge + เรียง `updatedAt desc`) · `/new` · `/[id]/edit` → เปิดเมนู `ready:true`
  - [x] ✅ verify (typecheck + lint ผ่าน · seed 3 หน้าสำเร็จ · HTTP จริงบน `:4000`): guest→307 (list+new) · **SUPER_ADMIN→200** list/new · edit หน้า seed จริง→200 · edit ที่ไม่มี→404
        · **3 หน้า seed ขึ้นในตารางครบ** (admission/regulations/curriculum เป็น DRAFT)
        · 🔒 **ยิง `createPage` ตรง** (token ASCII): **TEACHER→`ไม่มีสิทธิ์ทำรายการนี้` 0 แถว** · **positive control SUPER_ADMIN request เดียวกัน→1 แถว** ⇒ บล็อกด้วย RBAC
        · **slug ซ้ำ `admission`→`slug นี้ถูกใช้แล้ว` (fieldErrors.slug) ไม่มี dup เข้า DB** (isUniqueSlugError กับ Prisma 7 adapter) · ล้าง test data + temp TEACHER แล้ว (เหลือ 3 หน้า seed)
  > 🐛 **EPERM `.next` manifest ซ้ำ (problems.md 2.4) — ต้องรอ handle ปล่อยก่อน restart:** หลัง regenerate client แล้ว `rm -rf .next` + `pnpm dev` ทันที
  >    dev ตัวเก่ายังถือ handle `.next/dev/server/*manifest.js` ค้าง → ตัวใหม่ rename ไม่ได้ 500 ทุกหน้า → **kill process บน 4000 → `sleep 3` (รอปล่อย handle) → `rm -rf .next` → `pnpm dev`** ถึงหาย
  - [ ] ⏸️ **ยังไม่ได้ทดสอบคลิกจริง:** สร้าง/แก้/ลบผ่านฟอร์ม, Tiptap ในหน้า, ฟอร์มพรีฟิลตอนแก้ไข, toggle เผยแพร่/ร่างผ่านปุ่มตา, toast
- [x] **4.4.11 SiteSettings** *(เฉพาะ SUPER_ADMIN)* — ฟอร์ม key-value (ทั่วไป/ติดต่อ/social/map) ✅
  - [x] schema: `SiteSetting` (key unique · value · `@@map("site_setting")`) → migrate `add_site_setting` (additive)
  - [x] `lib/rbac.ts` — เพิ่ม `canManageSettings()` (SUPER_ADMIN เท่านั้น — เข้มกว่า content ที่ ADMIN ทำได้)
  - [x] `lib/site-settings.ts` — **แหล่งความจริงเดียวของชุดคีย์** (SETTING_GROUPS: `site.*`/`contact.*`/`social.*`/`map.*` + label/input type/placeholder)
        · **`fieldName()` แปลง `.`→`__`** เพราะ react-hook-form ตีชื่อ field ที่มี `.` เป็น nested path (กับดักที่กันไว้ล่วงหน้า)
  - [x] `lib/validations/site-settings.ts` — **สร้าง zod schema แบบ dynamic จากนิยาม** · ช่อง url ต้องเป็น URL (เว้นว่างได้) · ที่เหลือจำกัดความยาว
  - [x] `server/actions/site-settings.ts` — `updateSiteSettings` upsert ทั้งชุดใน transaction · **ค่าว่าง = ลบคีย์ทิ้ง** (ไม่เก็บ row ว่าง → Footer เช็ค "มีค่าไหม" ง่าย) · gate `canManageSettings` · วนตามนิยาม ไม่เชื่อคีย์แปลกจาก client
  - [x] component: `site-settings-form` (กลุ่มเป็น Card · Input/Textarea ตาม input type · RHF ใช้ชื่อ field `__`) · หน้า `/admin/settings` (`requireRole("SUPER_ADMIN")`) โหลดค่าปัจจุบันมาพรีฟิล → เปิดเมนู `ready:true`
  - [x] ✅ verify (typecheck + lint ผ่าน · HTTP จริงบน `:4000`): guest→307 · **SUPER_ADMIN→200** (4 กลุ่ม + label + field mapping `contact__phone` ครบ)
        · 🔒 **ADMIN ถูกกันทั้ง 2 ชั้น: หน้า→307 `/` + ยิง `updateSiteSettings` ตรง→`ไม่มีสิทธิ์ทำรายการนี้` ไม่มีอะไรเข้า DB** *(โมดูลนี้ ADMIN ก็เข้าไม่ได้ ต่างจาก content)*
        · **positive control: SUPER_ADMIN request เดียวกัน→บันทึกได้** ⇒ บล็อกด้วย RBAC ไม่ใช่ payload
        · **logic บันทึก (ค่า ASCII):** upsert 3 คีย์ที่มีค่า · **social.facebook ว่าง → ไม่ถูกเก็บ** (rows=3) · **save ซ้ำด้วย site.name ว่าง → ลบ row นั้น** (rows=1, contact.phone คงอยู่) · **url ผิด→`ลิงก์ไม่ถูกต้อง`** · ล้าง test data + temp ADMIN แล้ว
  > 📝 **RHF + dotted key:** ชื่อ field ที่มี `.` (เช่น `contact.phone`) RHF จะสร้าง nested object ให้ → เลี่ยงด้วยชื่อ field `contact__phone` แล้ว map กลับเป็น dotted key ตอนบันทึก
  > 📝 **zod schema แบบ index-signature:** `flatten().fieldErrors` มี type `string[] | undefined` (ต่างจาก schema คีย์คงที่) → cast เป็น `Record<string,string[]>` ให้ตรง `ActionResult` (ฟอร์มเช็ค `?.[0]` อยู่แล้ว)
  - [ ] ⏸️ **ยังไม่ได้ทดสอบคลิกจริง:** กรอก/บันทึกผ่านฟอร์ม, พรีฟิลค่าเดิมตอนเปิดหน้า, toast, url ผิดขึ้น error ตรงช่อง
- [x] **4.4.12 ContactMessages** — inbox, mark read, ลบ ✅
  - [x] schema: `ContactMessage` (name/email บังคับ · phone/subject ว่างได้ · isRead · `@@index([isRead, createdAt])`) → migrate `add_contact_message` (additive)
        > ⏭️ **ฝั่ง submit (public contact form + action) เลื่อนไป Phase 4.6** พร้อมหน้า "ติดต่อเรา" — 4.4.12 ทำเฉพาะ inbox แอดมิน · เทสต์ด้วย insert ผ่าน psql (แพตเทิร์นเดียวกับ banners/documents)
  - [x] `server/actions/contact-message.ts` — `setMessageRead(id, read)` + `deleteContactMessage(id)` gate `canManageContent` (ADMIN+ เหมือน content · nav ไม่ใช่ superAdminOnly) · setMessageRead ข้าม DB write ถ้าสถานะไม่เปลี่ยน (auto-mark ซ้ำไม่ยิง DB)
  - [x] component: `message-row-actions` (เปิดอ่าน/สลับอ่าน-ยังไม่อ่าน/ลบ) · `message-detail-actions` (สลับ+ลบ→เด้งกลับ inbox) · **`auto-mark-read`** (mark อ่านแล้วใน `useEffect` ตอนเปิดจริง — **จงใจไม่ mark ตอน render** เพราะ Next prefetch `<Link>` จะ mark ก่อนเวลา)
  - [x] หน้า: `/admin/messages` (ค้นหา ชื่อ/อีเมล/หัวข้อ/ข้อความ + กรองอ่าน/ยังไม่อ่าน + pagination + **ตัวนับ unread ใน header** + เรียงยังไม่อ่านก่อน) · `/admin/messages/[id]` (รายละเอียดเต็ม + ปุ่มตอบกลับ `mailto:` + tel:) → เปิดเมนู `ready:true`
  - [x] ✅ verify (typecheck + lint ผ่าน · HTTP จริงบน `:4000`): guest→307 · **SUPER_ADMIN→200** list/detail · detail bad id→404
        · **แทรก 3 ข้อความ (psql, token ASCII):** header ขึ้น "ยังไม่ได้อ่าน 2 รายการ" · badge ใหม่/อ่านแล้ว · **กรอง read=0 ซ่อนที่อ่านแล้ว · read=1 ซ่อนที่ยังไม่อ่าน (positive+control) · ค้นหา q=bob เจอเฉพาะ bob** · detail แสดง body/email/phone/subject/mailto ครบ
        · 🔒 **ยิง action ตรง:** TEACHER `setMessageRead`→`ไม่มีสิทธิ์` (isRead คง f) · **positive control SUPER_ADMIN→isRead=t** · TEACHER `deleteContactMessage`→`ไม่มีสิทธิ์` (ข้อความยังอยู่) ⇒ บล็อกด้วย RBAC · ล้าง test data + temp TEACHER แล้ว
  > 🐛 **กับดักที่กันไว้: mark-read ต้องอยู่ใน useEffect ไม่ใช่ตอน render** — Next prefetch `<Link>` หน้ารายละเอียดตอน hover → ถ้า mark อ่านแล้วใน server render จะกลายเป็นอ่านทั้งที่แค่เอาเมาส์ชี้ (ยังไม่เปิด)
  - [ ] ⏸️ **ยังไม่ได้ทดสอบคลิกจริง:** auto-mark-read ตอนเปิดหน้าจริง (client useEffect — curl รัน JS ไม่ได้), ปุ่มสลับ/ลบ, ตอบกลับ mailto, toast
- [x] **4.4.13 Users** *(เฉพาะ SUPER_ADMIN)* — สร้าง user, กำหนด role, ban/unban, reset password, ลบ ✅
  - [x] 🔓 **แก้ privilege escalation ก่อน (สำคัญ):** เดิม `adminRoles: ["SUPER_ADMIN","ADMIN"]` + `ADMIN = ac.newRole({...adminAc.statements})`
        → **ADMIN ยิง `/api/auth/admin/set-role` ตั้งตัวเองเป็น SUPER_ADMIN ได้จริง** (พิสูจน์แล้ว HTTP 200 role เปลี่ยน) รวมถึง create/ban/delete ผู้ใช้
        → แก้: `auth.ts` `adminRoles: ["SUPER_ADMIN"]` + `permissions.ts` `ADMIN = ac.newRole({})` (ADMIN จัดการเนื้อหาผ่าน `canManageContent` ไม่พึ่ง admin plugin) · ดู problems.md 7.6
  - [x] `lib/auth-client.ts` — `adminClient({ ac, roles })` ให้ client รู้จัก role จริง (ไม่งั้น type เป็น `"user"|"admin"`)
  - [x] `lib/validations/user.ts` — `createUserSchema` (name/email/password≥8/role) · `resetPasswordSchema` · `USER_ROLES`
  - [x] component: `user-create-form` (`authClient.admin.createUser` · อีเมลซ้ำ→ขึ้นตรงช่อง) · `user-row-actions` (dropdown: เปลี่ยนบทบาท/รีเซ็ตรหัสผ่าน/แบน-ปลดแบน/ลบ ผ่าน `authClient.admin.*` · **disable action บนแถวตัวเองกันล็อกตัวเองออก**)
  - [x] หน้า: `/admin/users` (`requireRole("SUPER_ADMIN")` · ค้นหา ชื่อ/อีเมล + กรอง role + pagination + badge role/สถานะ + ป้าย "(บัญชีคุณ)") · `/new` → เปิดเมนู `ready:true`
  - [x] ✅ verify (typecheck + lint ผ่าน · HTTP จริงบน `:4000`):
        · 🔒 **หลังแก้: ADMIN ยิง set-role/create-user/list-users ตรง → 403 ทั้งหมด · เข้าหน้า /admin/users → 307 `/`** · guest→307 · **SUPER_ADMIN→200** list/new
        · **positive control:** SUPER_ADMIN ยิงชุดเดียวกัน → 200 (set-role demote สำเร็จ) ⇒ lockdown ได้ผล ไม่พังของเดิม
        · **ฟีเจอร์ครบ (SUPER_ADMIN):** createUser (TEACHER) · banUser→banned=t · unbanUser→f · **setUserPassword→ล็อกอินด้วยรหัสใหม่ 200** · removeUser→หายจริง · list แสดง email/role label/ป้ายบัญชีคุณ · ล้าง test users แล้ว (เหลือ seed SUPER_ADMIN)
  > 🐛 **exploit ที่เจอ+ปิด:** endpoint `/api/auth/admin/*` เป็นคนละชั้นกับ proxy/หน้า — ซ่อนเมนู + `requireRole` ที่หน้าไม่พอ ต้องล็อกที่ `adminRoles`+`ac` (problems.md 7.6)
  - [ ] ⏸️ **ยังไม่ได้ทดสอบคลิกจริง:** สร้างผู้ใช้ผ่านฟอร์ม, dropdown เปลี่ยน role/รีเซ็ตรหัส/แบน/ลบ ผ่าน dialog, toast, ปุ่ม disable บนแถวตัวเอง
- [x] ✅ **Phase 4.4 เสร็จครบทุกโมดูล** — verify RBAC โดยรวม: ADMIN/SUPER_ADMIN จัดการเนื้อหา+publish ได้ · TEACHER ถูกกันทุก action (ยิงตรง→ปฏิเสธ) · Users/Settings = SUPER_ADMIN only (ADMIN ก็เข้าไม่ได้ ทั้งหน้าและ endpoint) · *(ยกการทดสอบคลิกจริงหน้า public publish→แสดงผล ไปทำพร้อม Phase 4.5/4.6 ที่มีหน้า public จริง)*

---

## Phase 4.5 — Public Site Foundation & Homepage

**เป้าหมาย:** โครงหน้าเว็บสาธารณะ + หน้าแรกสมบูรณ์

> 🎨 **ดีไซน์จากเจ้าของ (design MCP):** โปรเจกต์ "วัดไทยงาม เว็บไซต์โรงเรียน" (`Homepage.dc.html` + `DESIGN.md`) — implement ตาม mockup
> · DESIGN.md ตรงกับ tokens ใน `globals.css` อยู่แล้ว (คราม #333D6D + accent sky/mint/warning) · ฟอนต์ public = **Inter + Anuphan** (ต่างจากหลังบ้าน Noto Sans Thai)
> · โลโก้ต้นฉบับ 2211×2817px เกิน 256KiB (import ไม่ได้เต็ม) → `SchoolLogo` เช็ค `public/logo.png` ถ้ามีใช้เลย ไม่งั้น fallback ไอคอนในกรอบคราม · **เจ้าของวางไฟล์เองที่ `public/logo.png`**
- [x] `app/(public)/layout.tsx` — AnnouncementBar + Header + Footer + ฟอนต์ Inter/Anuphan · ลบ `app/page.tsx` เดิม (ชนกับ `(public)/page.tsx` ที่ map เป็น `/`)
- [x] Navbar (`site-header` + `desktop-nav`/`mobile-nav`) — โลโก้ + ชื่อ 2 บรรทัด (site.name/site.nameEn) + เมนู + ปุ่มค้นหา + CTA ติดต่อเรา · mobile = drawer (`sheet`) · **ไม่ใช้ `navigation-menu`/`command`** (ไม่ได้ติดตั้ง — ทำ nav เรียบด้วย link แทน)
- [x] `site-footer` — พื้นเข้ม #242B4E · 4 คอลัมน์ (แบรนด์/เมนู/ข้อมูล/ติดต่อ) ดึงจาก SiteSetting (contact + social) · social icon (facebook/youtube inline SVG เพราะ lucide v1 ตัดไอคอนแบรนด์)
- [x] `announcement-bar` — ประกาศ active + อยู่ในช่วงเวลา (`getActiveAnnouncements` cached) · พื้นคราม + pill "ประกาศ"
- [x] **หน้าแรก** `app/(public)/page.tsx` — query ขนาน (banner/news/works/event) + ประกอบ section:
  - [x] **Hero** — แบรนด์ไล่เฉด + หัวเรื่อง/คำโปรย/สถิติ (จาก SiteSetting group "หน้าแรก") + `HeroSlider` (client) ภาพจาก **Banner** active + dots · ไม่มีแบนเนอร์ → placeholder
  - [x] **ข่าว** — featured (ใบใหญ่ span 2 แถว) + 4 ใบเล็ก (`news-section`, ordering featured→publishedAt)
  - [x] **ผลงาน/สื่อ** — 3 ใบ + play overlay + type badge (`works-section`, reuse `mediaWorkThumbnail`)
  - [x] **กิจกรรมเร็ว ๆ นี้** — 3 รายการ (startDate≥วันนี้ หรือยังไม่จบ) + date box + แถบสี (`events-section`)
  - [x] **CTA ปิดหน้า** — กล่องไล่เฉดคราม + 2 ปุ่ม *(เดิมเป็น CTA รับสมัคร → เปลี่ยนเป็น "ติดตามข่าวสาร" 2026-07-21 ดูหมายเหตุตัดรับสมัคร)*
  - [x] Quick links strip 4 การ์ด *(อัลบั้มภาพ/ปฏิทิน/เอกสาร/บุคลากร — เดิมการ์ดแรกเป็นรับสมัคร → เปลี่ยนเป็นอัลบั้มภาพ)*
- [x] เพิ่ม SiteSetting group "ข้อมูลทั่วไป" (site.nameEn) + "หน้าแรก (Hero)" (heroTitle/heroSubtitle/สถิติ 3 ตัว) — ฟอร์มตั้งค่า auto-render จากนิยาม
- [x] ✅ verify (typecheck + lint ผ่าน · HTTP จริง `:4000` + **screenshot desktop 1440 + mobile 390**):
      หน้าแรก 200 · **แสดงข้อมูลจริงจาก DB ครบทุก section** (banner ภาพจริงใน hero, ข่าว featured+เล็ก, ผลงานมี play, กิจกรรม 2 รายการ, footer ดึง contact/social ที่เจ้าของกรอก) · empty section ซ่อนเอง
      · **responsive:** desktop 3 คอลัมน์/nav แนวนอน · mobile คอลัมน์เดียว + hamburger drawer + quick links 2×2 · stats card ย้ายลงล่างบนจอเล็ก
  - [x] เจ้าของวาง `public/logo.png` แล้ว (2026-07-20) → SchoolLogo หยิบไปใช้อัตโนมัติ · ทดสอบคลิกจริงแล้ว ใช้ได้
  - [x] ✅ **แก้ responsive Hero + แถบประกาศแล้ว (2026-07-21 — verify ด้วย Chrome CDP วัด overflow=0 ที่ 320/360/390/768px):**
        - **แถบประกาศ → marquee** (`announcement-marquee` client · โชว์ประกาศ active ทุกอัน · hover หยุด)
          > 🐛 **2 บั๊กที่เจ้าของเจอตอนทดสอบ (แก้แล้ว):** (1) **นิ่งสนิท** — เขียน `@keyframes`/`.animate-marquee` raw ใน globals.css แต่ **Tailwind v4 strip ทิ้ง** (CSS ไม่ออก) → ต้องลงผ่าน **`@theme --animate-marquee`** (problems.md 5.7) · (2) **เห็นข้อความซ้ำ 2 ชุด** ตอนประกาศเดียว+จอกว้าง (duplicate สำหรับ loop โผล่พร้อมกัน) → วัด `ResizeObserver` **เลื่อน/duplicate เฉพาะตอนล้นกรอบ** (มือถือ) · จอกว้างพอดี = นิ่งชุดเดียว · verify CDP: 1440px `copies:1,animating:false` · 390px `copies:2,animating:true`
        - **คำขวัญ (hero badge) + หัวเรื่อง + subtitle** เลิก `truncate` → wrap · หัวเรื่องลดเป็น `text-[26px]` บนจอเล็ก
        - 🐛 **ต้นตอ overflow แนวนอนทั้งหน้า = กับดัก min-width:auto** — (1) hero `grid` ไม่มี `grid-cols-1` ฐาน → auto track ขยายเกิน viewport → เพิ่ม `grid-cols-1` (minmax(0,1fr)) + `min-w-0` ที่ทั้งสองคอลัมน์ · (2) marquee viewport `flex-1 overflow-hidden` ขาด `min-w-0` → flex item ไม่หดต่ำกว่า track `w-max` ดันความกว้าง body → เพิ่ม `min-w-0`
        - **banner หลักใหญ่เกินบน tablet/มือถือ** (4/3 เต็มกว้าง) → `hero-slider` ใช้ `aspect-video lg:aspect-[4/3]` (16/9 จอเล็ก เตี้ยลง+เห็นภาพกว้างขึ้น · 4/3 เฉพาะ desktop 2 คอลัมน์)
        > 📸 **บทเรียน:** Chrome `--screenshot` แยก instance จับภาพตอน dev server กำลัง recompile ได้ภาพ **stale** (เห็นคลิปทั้งที่แก้แล้ว) → ยืนยันด้วย **CDP `Page.reload`+วัด `scrollWidth-clientWidth` / `Page.captureScreenshot`** บน instance เดียวที่โหลดเสร็จแทน (Node 24 มี global WebSocket ต่อ CDP ตรงได้)
  - [x] ✅ ปุ่มค้นหา → `/search` **ใช้งานได้แล้ว (Phase 4.7)** · ลิงก์หน้า feature (/news, /works…) ครบตั้งแต่ Phase 4.6

---

## Phase 4.6 — Public Feature Pages

**เป้าหมาย:** หน้าเนื้อหาสาธารณะครบ (ทำตาม Playbook ทุกหน้า)

> 🎨 **แบบหน้า public จาก design MCP:** `Public Pages.dc.html` (project "วัดไทยงาม เว็บไซต์โรงเรียน") — ครบ 6 หน้า (ข่าว/รายละเอียดข่าว/ผลงาน/ปฏิทิน/บุคลากร/ติดต่อ) โทนเดียวกับหน้าแรก · `Index.dc.html` เป็นแค่หน้าปกสารบัญ mockup ไม่ใช่หน้าเว็บ
> 📅 **เปลี่ยนวันที่ทั้งเว็บเป็น พ.ศ. แล้ว (2026-07-21 — หนี้ 4.4.4/4.8)** — `lib/date.ts` (`formatThaiDate` long/medium/short/dayMonth · `formatThaiDateTime`) แทน `format(...,"d MMM yy",{locale:th})` เดิมทุกจุด (public + admin: news/works/albums/pages/users/messages/dashboard + `lib/event.ts` `formatEventRange` + `lib/announcement.ts`) · date-fns ให้ปี ค.ศ. เสมอ จึง format วัน+เดือนแล้วต่อปี (ค.ศ.+543) เอง

- [x] **ข่าว** `/news` (list + filter category + pagination) & `/news/[slug]` (viewCount, related) ✅
  - [x] `/news` — PageHero ไล่เฉดคราม + pill กรองหมวด (link `?category=slug`) + ค้นหา (reuse `table-search` → `?q=` title/excerpt) + กริด 3 คอลัมน์ + `PublicPagination` (เลขหน้า + … ตาม mockup) · empty state
  - [x] `/news/[slug]` — article + sidebar "ข่าวที่เกี่ยวข้อง" (หมวดเดียวกัน 3 ข่าว) · badge/วันที่ long/ยอดวิว · tags · `generateMetadata` (title/excerpt) · `notFound()` ถ้าไม่มี/ไม่ PUBLISHED
  - [x] `getNews()` ครอบ `React.cache` กัน query ซ้ำระหว่าง `generateMetadata` กับหน้า
  - [x] component ใหม่: `page-hero` · `public-pagination` · `news-view-counter` (client)
  - [x] เนื้อหา render ด้วย `dangerouslySetInnerHTML` + arbitrary-variant prose (เหมือน editor แต่ขนาดใหญ่กว่า) · *(sanitize HTML → Phase 4.8)*
  > ✅ **`viewCount++` แก้ตามที่กังวลไว้:** `server/actions/news-view.ts` `incrementNewsView(id)` — ยิงจาก client `useEffect` (ไม่ใช่ตอน render) + `useRef` กัน double-invoke (Strict Mode) + **ไม่ revalidate** → หน้ารายละเอียดยัง cacheable ได้ตอนเปิด cache ใน 4.8 (การนับเป็น side-effect เบา ๆ แยกจาก render)
  - [x] ✅ verify (typecheck + lint ผ่าน · HTTP จริง `:4000`): `/news`=200 (+ `?category=`, `?q=`) · detail=200 · **ไม่มี/DRAFT slug → 404** · list การ์ด/วันที่ พ.ศ. (2569)/badge sky · detail long date "17 กรกฎาคม 2569"/related/back link ขึ้นครบ
  > 🐛 **EPERM `.next` manifest (problems.md 2.4) โผล่ตอน compile route แรกที่มี server action ใหม่** (`server-reference-manifest.js` ถูก rewrite ตอนเจอ `incrementNewsView`) → 500 ครั้งเดียว, request ถัดไป compile ใหม่ = 200 · ไม่ใช่บั๊กโค้ด (มี dev server เก่าค้างถือ handle → kill 4000 + `rm -rf .next` + restart)
  - [x] ✅ **ทดสอบคลิกจริงแล้ว (เจ้าของ 2026-07-21):** ค้นหา/กรองหมวดสลับไปมา · viewCount · related คลิกข้าม · responsive *(tag filter ยังไม่ทำ — mockup ใช้แค่หมวด)*
- [x] **ผลงาน** `/works` (grid) & `/works/[slug]` — **YouTubeEmbed** เล่นในหน้า / video / article ✅
  - [x] `/works` — PageHero + แท็บ ทั้งหมด/วิดีโอ/บทความ (`?type=video|article` · วิดีโอ = YOUTUBE+VIDEO) + กริด 3 คอลัมน์ + play overlay + badge ชนิด + "โดย {author}" + `PublicPagination` · empty state
  - [x] `/works/[slug]` — render ตามชนิด: **YOUTUBE → `YouTubeEmbed`** (nocookie iframe, `loading=lazy`) · VIDEO → `<video controls poster>` · ARTICLE → รูปปก + prose · + badge/วันที่ long/author/description/tags · `generateMetadata` · `notFound()`
  - [x] component ใหม่ `youtube-embed` (reuse `extractYoutubeId`/`youtubeEmbedUrl`) · reuse `mediaWorkThumbnail`
  - [x] ยก prose class เป็น `lib/prose.ts` (`articleProse`) ใช้ร่วม news/works detail (+หน้า Page ทีหลัง)
  - [x] ✅ verify (tsc + lint ผ่าน · HTTP `:4000`): `/works`=200 (+`?type=video|article`) · detail=200 (ฝัง `youtube-nocookie.com/embed/…` จริง) · slug ไม่มี→404 · แท็บบทความ empty state · badge/play/author/วันที่ พ.ศ. ขึ้นครบ
  - [x] ✅ **ทดสอบคลิกจริงแล้ว (เจ้าของ 2026-07-21):** เล่นวิดีโอ YouTube ในหน้า · แท็บสลับ · responsive *(VIDEO/ARTICLE ยังไม่มีข้อมูลชนิดนี้ใน DB — รอแอดมินเพิ่ม)*
- [x] **ปฏิทิน** `/calendar` — FullCalendar (month/list, สี event, คลิกดูรายละเอียด) ✅
  - [x] ติดตั้ง FullCalendar **pin 6.1.21 ทั้งชุด** (`@fullcalendar/react core daygrid list interaction`) — ⚠️ ครั้งแรก pnpm ลง core/react เป็น 7.0.1 แต่ plugin 6.1.21 (major ไม่ตรง = พัง) → ต้อง pin เวอร์ชันเดียวกันทุกตัว
  - [x] `components/public/event-calendar` (client) — dayGrid/list + locale `th` + toolbar (prev/next/today · เดือน/รายการ) · สีจาก `event.color` · **allDay end +1 วัน** (FC ตี end เป็น exclusive) · คลิก event → Dialog (ชื่อ + `formatEventRange` + สถานที่)
  - [x] `/calendar` (server) query PUBLISHED events → ส่ง ISO ให้ client · **ไม่ทำ legend ตายตัวตาม mockup** (สีเป็นค่าอิสระต่อ event ไม่ใช่หมวด)
  > 📝 **FullCalendar โหลดด้วย `next/dynamic({ssr:false})`** ไม่ใช่ mounted-state guard — lint rule ใหม่ `react-hooks/set-state-in-effect` ห้าม `setState` ใน `useEffect` (`useEffect(()=>setMounted(true),[])` โดนแบน) · dynamic ssr:false ได้ผลเดียวกันแต่สะอาดกว่า + มี loading skeleton
  - [x] ✅ verify (tsc + lint ผ่าน · HTTP `:4000`): `/calendar`=200 (shell + skeleton — FC เรนเดอร์ client) ไม่มี error ในล็อก · 3 events PUBLISHED ใน DB
  - [x] ✅ **ทดสอบคลิกจริงแล้ว (เจ้าของ 2026-07-21):** widget FullCalendar เรนเดอร์/สลับ month↔list · สี event · คลิกเปิด Dialog · prev/next/today · mobile
- [x] **อัลบั้ม** `/albums` & `/albums/[slug]` — lightbox + **ปุ่มกดไลก์** (Server Action + fingerprint กันซ้ำ, optimistic UI) ✅
  - [x] schema: **`AlbumLike`** (+ `Album.likes` relation ที่เลื่อนไว้จาก 4.4.6) → migrate `add_album_like` (additive ล้วน · `@@unique([albumId, fingerprint])` + `onDelete: Cascade`)
  - [x] **`server/actions/album-like.ts` `toggleAlbumLike`** — visitor ระบุด้วย **cookie `visitor_id`** (httpOnly, ตั้งครั้งแรกที่กดไลก์ · แม่นกว่า IP+UA) · like/unlike ใน `$transaction` (upsert/delete AlbumLike + inc/dec likeCount พร้อมกัน) · unique กันไลก์ซ้ำ
  - [x] `album-like-button` (client, **optimistic** — สลับ+นับทันทีแล้ว sync ค่าจริง) · `photo-gallery` (client — กริด + **lightbox** เต็มจอ prev/next, Esc/ลูกศร, ล็อกสกอลล์พื้นหลัง)
  - [x] `/albums` — PageHero + กริดการ์ด (cover=coverImage หรือรูปแรก · จำนวนรูป overlay · likeCount) · empty state · `/albums/[slug]` — header + like button (อ่าน liked ของ visitor จาก cookie ฝั่ง RSC) + gallery · `generateMetadata` · `notFound()`
  - [x] ✅ verify (tsc + lint · HTTP `:4000`): `/albums`=200 · detail=200 · slug มั่ว=404 · 🔒 **ยิง `toggleAlbumLike` ตรง (Next-Action id + cookie jar จำลอง visitor เดิม):** like#1 → **likeCount 0→1 + album_like 0→1 + ตั้ง cookie visitor_id** · like#2 (cookie เดิม) → **unlike 1→0 + 0 row** ⇒ transaction + unique + cookie fingerprint ทำงานครบ · DB สะอาด
  > 🐛 EPERM `.next` ตอน compile detail ครั้งแรก (มี server action ใหม่) → 500 ครั้งเดียว, ถัดไป 200 (เหมือน news/works — Windows, ไม่ใช่บั๊ก)
  - [x] ✅ **ทดสอบคลิกจริงแล้ว (เจ้าของ 2026-07-21):** lightbox เปิด/เลื่อน/ปิด · ปุ่มไลก์ optimistic + refresh แล้วสถานะคง (cookie) · responsive กริด
- [x] **เอกสาร** `/documents` — list ตามหมวด + ปุ่มดาวน์โหลด (downloadCount++) ✅
  - [x] `/documents` — PageHero + จัดกลุ่มตาม `category` (null→"ทั่วไป") + การ์ดแถว (ไอคอน + ชื่อ + `documentFileLabel` + downloadCount + ปุ่มดาวน์โหลด) · empty state
  - [x] **`/documents/[id]/download` route handler** — นับ downloadCount++ **ตอนคลิกจริง** แล้ว `redirect(fileUrl)` · ลิงก์เป็น **`<a>` ธรรมดา ไม่ใช่ `<Link>`** (กัน prefetch นับเกินตอน hover — บทเรียนเดียวกับ mark-read 4.4.12) · หน้า list ยัง cacheable
  - [x] ✅ verify (tsc + lint ผ่าน · HTTP `:4000`): `/documents`=200 · **download route: 307 → fileUrl จริง (Google Drive) + downloadCount 0→1** · bad id→404 · เลขเป็นอารบิก (ตรง mockup) · ล้างค่าทดสอบกลับ 0
  - [x] ✅ **ทดสอบคลิกจริงแล้ว (เจ้าของ 2026-07-21):** กดปุ่มดาวน์โหลดเปิดไฟล์จริง · responsive
- [x] **บุคลากร** `/staff` — การ์ดเรียงตาม order/แผนก ✅
  - [x] `/staff` — PageHero + **จัดกลุ่มตาม `department`** (null→"บุคลากรอื่น ๆ") เรียงกลุ่มตามลำดับที่พบ (staff เรียง `order asc,name asc` → กลุ่มคนลำดับต้นมาก่อน) · แถบสีหัวกลุ่มวน primary→sky→mint · การ์ดรูปสี่เหลี่ยม + ชื่อ + ตำแหน่ง · fallback ไอคอน `UserRound` · empty state · **ไม่มีหน้า detail** (ตาม roadmap)
  - [x] ✅ verify (tsc + lint ผ่าน · HTTP `:4000`): `/staff`=200 · group "ฝ่ายบริหาร" + ตำแหน่ง "ผู้อำนวยการ" + แถบ primary ขึ้น (isActive 2 คน)
  - [x] ✅ **ทดสอบคลิกจริงแล้ว (เจ้าของ 2026-07-21):** รูปจริง · responsive 4→2 คอลัมน์ *(มีกลุ่มเดียวใน DB ตอนนี้ — สีแถบวนหลายกลุ่มรอข้อมูลเพิ่ม)*
  - [x] 🔧 **แก้เพิ่ม 2026-07-26 — จัดลำดับใช้งานได้จริง** *(เจ้าของแจ้ง: เพิ่ม ผอ. แล้วไม่ขึ้นบนสุด)*
        เดิมลำดับกลุ่ม**ตั้งเองไม่ได้** (มาจาก `order` ต่ำสุดของสมาชิก) + คนใหม่ได้ `max+1` = ต่อท้ายเสมอ ต้องไล่แก้เลขมือทีละคน
        - schema: **`StaffDepartment`** (`name` unique + `order`) → migrate `add_staff_department` · upsert อัตโนมัติตอนบันทึกบุคลากร ไม่ต้องสร้างกลุ่มก่อน · **ไม่ทำ FK โดยตั้งใจ** (`Staff.department` ยังพิมพ์อิสระ)
        - `Staff.order` เปลี่ยนความหมายเป็น **ลำดับภายในกลุ่มตัวเอง** (ไม่ใช่ลำดับรวม) — migration backfill ลำดับกลุ่มจาก min(order) เดิม ทำให้เปิดมาเห็นเหมือนก่อนแก้
        - `lib/staff.ts` `groupStaffByDepartment()` — **แชร์กันระหว่าง public + admin** (ต้องเรียงตรงกันเป๊ะ ไม่งั้นปุ่ม ▲▼ ขยับไม่ตรงที่เห็น) · กลุ่ม null = "บุคลากรอื่น ๆ" ตรึงล่างสุด
        - actions `moveStaff` / `moveStaffDepartment` — เขียน `order` ใหม่ 0..n-1 ทั้งชุดใน `$transaction` (normalize เลขซ้ำทิ้งไปในตัว) · ย้ายกลุ่มนับเฉพาะกลุ่มที่**มีคนอยู่จริง** ไม่งั้นกลุ่มร้างทำให้กดแล้ว "ไม่ขยับ"
        - `/admin/staff` เปลี่ยนเป็น **แสดงเป็นกลุ่มเหมือนหน้าเว็บ + ▲▼ ที่หัวกลุ่มและแต่ละแถว** · **ตัด pagination ทิ้ง** (คนท้ายหน้า 1 กดเลื่อนลงแล้วหายไปหน้า 2) · กรองอยู่ = ปิดปุ่ม + ขึ้นคำอธิบาย
        - **ถอดช่อง "ลำดับการแสดง" ออกจากฟอร์ม** — คนใหม่/คนย้ายฝ่ายไปต่อท้ายกลุ่มอัตโนมัติ (สองกลไกตีกัน)
  - [x] ✅ verify 2026-07-26 (tsc + lint ผ่าน · คลิกจริงบน `:4000`): เลื่อนกลุ่ม "ฝ่ายบริหาร" ขึ้นบนสุด → **หน้า `/staff` ตรงกัน** · เพิ่มคนผ่านฟอร์มจริง (ไม่มีช่อง order) → ต่อท้ายกลุ่มถูก · แก้ฝ่าย → ย้ายไปท้ายกลุ่มใหม่ + กลุ่มร้างหายจากหน้าจอ · เลื่อนคนขึ้น/ลงในกลุ่มได้ทั้งสองทิศ · ปุ่มสุดขอบถูก disable · **console สะอาด (ยิง positive control ยืนยันตัวอ่านทำงาน)** · ล้างข้อมูลทดสอบแล้ว
- [x] **ระเบียบ / หลักสูตร (+ หน้าอื่นที่แอดมินเพิ่ม)** — render จาก `Page` (DB) ผ่าน `/[slug]` ✅ *(ตัด "รับสมัคร" ออก — ดูหมายเหตุด้านล่าง)*
  - [x] `app/(public)/[slug]/page.tsx` — dynamic route ท้ายสุด (folder ที่มีชื่อ match ก่อน) · getPage cache + `generateMetadata` · PageHero + prose (`articleProse`) · **ไม่มี/DRAFT → 404**
  - [x] ✅ verify (tsc+lint · HTTP): `/regulations`+`/curriculum` (PUBLISHED)=200 · slug มั่ว/ไม่มี=404

> 🗑️ **ตัด "การรับสมัครนักเรียน" ออกทั้งหมด (2026-07-21 — เจ้าของสั่ง โรงเรียนไม่มีการรับสมัคร):**
> ปุ่ม/ลิงก์ `/admission` เอาออกจาก **hero (สมัครเรียน→"ข่าวสารและกิจกรรม"/news)** · **CtaSection (สมัครเรียน→ดูข่าวสาร, หัวเรื่องเป็น "ติดตามข่าวสาร")** · **quick-links (การ์ดรับสมัคร→อัลบั้มภาพ)** · **navbar/footer** (ลบลิงก์การรับสมัคร) ·
> ลบหน้า `admission` ออกจาก `prisma/seed.ts` + ลบ row ใน DB (เดิมเป็น DRAFT placeholder ยังไม่มีเนื้อหาจริง) · เก็บ placeholder example ที่อ้างรับสมัครใน admin (banner-form/page-form/pages description) → เปลี่ยนเป็นตัวอย่างอื่น · `Page`/`/[slug]` ยังยืดหยุ่น แอดมินสร้าง slug อะไรก็ได้

> 🖼️ **การ์ดภาพข่าว/กิจกรรมรองรับภาพแนวตั้ง+แนวนอนคละกัน (2026-07-21 — เจ้าของสั่ง):** ทำ `components/public/cover-image.tsx` — ภาพจริง `object-contain` (เห็นเต็มใบ ไม่ครอป) ซ้อนบนพื้นหลังภาพเดิมเบลอ `object-cover blur-2xl` (เติมกรอบให้เต็ม ไม่เหลือช่องโล่ง · โหลด URL เดียว browser cache) · ใช้ที่ news-section (หน้าแรก) · news list · news detail cover · news-card · **verify HTTP: `object-contain`+`blur-2xl` เรนเดอร์จริง** · *(works=thumbnail YouTube 16/9 คงเดิม cover · album grid/cover ยังไม่เปลี่ยน — ถ้าต้องการค่อยขยาย)*
- [x] **เกี่ยวกับ** `/about` — hardcode + ดึง SiteSetting บางส่วน ✅
  - [x] PageHero + intro (site.name/tagline จาก SiteSetting) + การ์ด ปรัชญา/วิสัยทัศน์/พันธกิจ (ข้อความทั่วไป **ไม่ปั้นตัวเลข/ข้อเท็จจริงปลอม**) + CTA ติดต่อ · verify 200
- [x] **ติดต่อ** `/contact` — ฟอร์ม (สร้าง ContactMessage) + Google Map embed + ข้อมูลติดต่อ ✅
  - [x] `lib/validations/contact.ts` + **`submitContactMessage` (public — ไม่ต้องล็อกอิน)** ใน `server/actions/contact-message.ts` (ฝั่ง submit ที่เลื่อนมาจาก 4.4.12) · `components/public/contact-form` (RHF + `standardSchemaResolver` · **inline success state** ไม่พึ่ง Toaster ที่ public layout ยังไม่มี)
  - [x] `/contact` — การ์ดข้อมูลติดต่อ (contact.address/phone/email/hours จาก SiteSetting) + map (`mapEmbedSrc` ยอมเฉพาะ google.com https) + ฟอร์ม · โทร/เมล เป็น `tel:`/`mailto:`
  - [x] ✅ verify (tsc+lint · HTTP `:4000`): `/contact`=200 (ฟอร์ม+map iframe) · 🔒 **ยิง `submitContactMessage` ตรง (Next-Action id, token ASCII):** valid→`ok:true` row เข้า inbox unread · **invalid (email เสีย/ข้อความว่าง)→`ok:false`+`fieldErrors` 0 row** (positive+negative control) · ล้างข้อมูลทดสอบแล้ว · ⚠️ rate-limit ยกไป 4.8
  - [x] ✅ **ทดสอบคลิกจริงแล้ว (เจ้าของ 2026-07-21):** กรอกฟอร์มส่ง→success card · error ตรงช่อง *(map แสดงเมื่อตั้ง SiteSetting `map.embed`)*
- [x] ✅ verify: ทุกหน้าเปิดได้ มี 4 states, mobile ใช้งานได้ — **ทุกหน้า public เปิด 200 + logic/action ผ่าน HTTP + เจ้าของคลิกทดสอบรวมแล้ว (2026-07-21)** · *(ยกไป Phase 4.8: `error.tsx`/`loading.tsx`/`not-found.tsx` ต่อ route group)*
  > 🔧 **แก้ตอนเจ้าของทดสอบ (2026-07-21):** "อัลบั้มภาพ" ไม่มีในเมนูหลัก desktop (อยู่ใน `publicNavExtra` = drawer มือถือเท่านั้น) → **ย้ายขึ้น `publicNav`** ถัดจาก "ผลงาน/สื่อ" (เอาออกจาก extra กันซ้ำ) · เมนูหลักตอนนี้ 7 อัน · documents/admission ยังอยู่ใน drawer + quick-links (ถ้าจะขึ้นเมนูหลักด้วย → ทำ dropdown "เพิ่มเติม")

---

## Phase 4.7 — Search & SEO

**เป้าหมาย:** ค้นเจอ + Google เก็บ index ได้

- [x] **`/search`** — ค้น News/MediaWork/Page (Prisma `contains` + `mode:"insensitive"`) + ปุ่มค้นบน Navbar ใช้งานได้แล้ว ✅
  - [x] `lib/text.ts` — `htmlToText()`/`excerptFromHtml()` ตัด HTML จาก Tiptap มาทำตัวอย่างผลค้นหา *(คนละเรื่องกับ sanitize ของ 4.8 — อันนี้แสดงเป็นข้อความล้วน React escape ให้เอง)*
  - [x] `components/public/search-box` — **กด Enter/ปุ่มถึงค้น ไม่ debounce แบบ `table-search`** (หน้านี้ยิง 3 ตาราง ไม่ควรยิงทุกตัวอักษร)
  - [x] หน้า: PageHero + กล่องค้นหาลอยคร่อมขอบ + **แท็บ ทั้งหมด/ข่าวสาร/ผลงาน/หน้าข้อมูล พร้อมตัวเลขต่อกลุ่ม** (`?type=`)
        · แท็บ "ทั้งหมด" โชว์กลุ่มละ 4 + ลิงก์ "ดูทั้งหมด →" · แท็บเจาะจงแบ่งหน้า (`PublicPagination`) · empty state + สถานะ "ยังไม่พิมพ์คำค้น" (ไม่ยิง DB)
  - [x] `robots: { index:false, follow:true }` — หน้าผลค้นหาไม่ควรถูก index (เนื้อหาซ้ำ + สร้าง URL ได้ไม่จำกัด) และไม่อยู่ใน sitemap
- [x] **`generateMetadata` ต่อหน้า** (title/description/OG/canonical) ✅
  - [x] `lib/site-url.ts` (`siteUrl()`/`absoluteUrl()`) + `metadataBase` ใน root layout → path สัมพัทธ์กลายเป็น absolute
  - [x] **`lib/metadata.ts` — `buildOpenGraph()`/`buildTwitter()` เป็นแหล่งเดียว** (เหตุผลอยู่ในบั๊กด้านล่าง)
  - [x] news/works/albums/`[slug]` detail: og:title/description/รูปปกจริง/`article:published_time`/`canonical`
- [x] **`app/sitemap.ts`** — 9 หน้าคงที่ + slug ที่ **PUBLISHED เท่านั้น** (news/works/albums/pages) · `lastModified` จาก `updatedAt` · `revalidate = 3600`
- [x] **`app/robots.ts`** — allow `/` · disallow `/admin` `/api` `/login` · ชี้ `Sitemap:` ไปที่ absolute URL
- [x] **JSON-LD** — `lib/structured-data.ts` + `components/public/json-ld` (escape `<` กัน `</script>` หลุด)
      · **`School`** (ชื่อ/คำขวัญ/โลโก้/เบอร์/อีเมล/ที่อยู่/social จาก SiteSetting จริง — ไม่มีค่าไหนตัดคีย์นั้นทิ้ง ไม่ปั้นข้อมูล) ที่หน้าแรก + `/about`
      · **`Article`** (headline/รูป/datePublished/dateModified/author/publisher) ที่ news + works detail
- [x] **OG image แบบ dynamic** — `app/og.png/route.tsx` (`ImageResponse`) โลโก้ + ชื่อไทย/อังกฤษ + คำขวัญ บนพื้นไล่เฉดคราม 1200×630 · `revalidate = 3600`
- [x] `.env.example` เพิ่ม **`NEXT_PUBLIC_SITE_URL`** *(ไม่ตั้ง = ใช้ `BETTER_AUTH_URL` · ⚠️ ตอน deploy ต้องเป็นโดเมน https จริง ไม่งั้น sitemap/OG ชี้ localhost)*
- [x] ✅ verify (tsc + lint ผ่าน · **`pnpm build` ผ่าน 42/42 หน้า** · HTTP จริงบน `:4000`):
  - `/robots.txt` = 200 เนื้อหาถูก · `/sitemap.xml` = 200 **17 URL** ตรงกับ DB เป๊ะ (news 3 / works 2 / albums 1 / pages 2 + คงที่ 9)
    · 🔒 **negative control: ข่าว DRAFT `sport-day` ไม่อยู่ใน sitemap** (ใน DB มี 4 ข่าว ออกมา 3) ⇒ กรอง `status` ทำงานจริง
  - `/search` ค้นภาษาไทยได้: `ทดสอบ`→4 (ข่าว 3 + ผลงาน 1 · เจอจากทั้ง title และ content) · `ผลงาน`→2 · `โรงเรียน`→1 (หน้า `/regulations`)
    · **แท็บ `?type=news`→3 · `?type=works`→1** (กรองถูก) · 🔒 **`กีฬาเสียง` (ข่าว DRAFT) → ไม่พบผลลัพธ์** · `zzzxxqq` → ไม่พบ
  - **OG/meta ครบทุกหน้าที่ตรวจ 9 หน้า:** og:title = ชื่อหน้าจริง · og:site_name มีทุกหน้า · **og:image มีทุกหน้า** (รูปปก Cloudinary/YouTube thumbnail ของจริง หรือ `/og.png`)
    · canonical ที่หน้า detail · `/search` = `noindex, follow`
  - **`/og.png` = 200 `image/png` 105 KB — เปิดดูรูปจริงแล้ว ตัวอักษรไทยเรนเดอร์ถูก ไม่ใช่กล่องสี่เหลี่ยม** (ดูบั๊กฟอนต์ด้านล่าง)
  - JSON-LD parse ผ่าน: School (ที่อยู่/เบอร์/อีเมล/sameAs จาก SiteSetting จริง) · Article (author "ผู้ดูแลระบบ", datePublished/dateModified ถูก)
> 🐛 **บั๊กที่เจอตอน verify (แก้แล้ว — ทั้งคู่มองไม่เห็นถ้าดูแค่ status 200):**
> 1. **`openGraph` ของหน้า ทับของ layout ทั้งก้อน** (Next merge แบบ shallow) → หน้าผลงานที่ไม่มีรูปปก **ไม่มี `og:image` เลย**
>    (รูปจาก `opengraph-image.tsx` file convention หายไปด้วย) · และ `openGraph.title` ที่ layout ทำให้ **ทุกหน้าได้ og:title เป็นชื่อเว็บ**
>    → ยกเป็น `lib/metadata.ts` (`buildOpenGraph`) + เลิกตั้ง title/description ที่ layout · problems.md 5.9
> 2. **`/opengraph-image` ตอบ 404** — URL จริงมี hash ต่อท้าย (`/opengraph-image-1c1a04?…`) แต่ JSON-LD ชี้ path เปล่า = ลิงก์เสีย
>    → ย้ายเป็น route **`/og.png`** URL คงที่ อ้างซ้ำได้ทุกที่
> ⚠️ **ฟอนต์ไทยใน `ImageResponse`:** ตัวที่มากับ `next/og` เป็น Geist (ละตินล้วน) → ต้องโหลด TTF เอง (`assets/Anuphan-SemiBold.ttf`)
>    ดึงจาก Google Fonts ต้องส่ง `User-Agent: Mozilla/5.0` — UA เป็น MSIE จะได้ **EOT**, UA ใหม่จะได้ **woff2** ซึ่ง satori อ่านไม่ออกทั้งคู่ · problems.md 5.10
> ⚠️ **`sitemap.ts`/`robots.ts` ถูก prerender เป็น static ตอน build** ถ้าไม่ตั้ง `revalidate` → sitemap แช่แข็งตั้งแต่วัน deploy · problems.md 5.11
> 🔥 **เจอตอนลอง `pnpm build`: build ต้องมี DB ที่ต่อติดจริง** (หน้า public หลายหน้า prerender เป็น static แล้วยิง Prisma)
>    พิสูจน์ด้วยการ `docker stop` แล้ว build → `ECONNREFUSED` prerender `/about` exit 1 · **มีผลกับแผน deploy 4.8 (runner ไม่มี DB)** · problems.md 8.6
- [ ] ⏸️ **ยังไม่ได้ทดสอบคลิกจริง:** พิมพ์ค้นในช่อง/กด Enter, กดปุ่มค้นหาบน navbar, สลับแท็บ, แบ่งหน้า, preview การ์ดแชร์ใน Facebook/LINE จริง

---

## Phase 4.8 — Polish, QA & Deploy

**เป้าหมาย:** ขัดเงา + ปล่อยจริง

- [x] **Loading / error / not-found ครบทุก route group** ✅ *(2026-07-23)*
  - [x] `error.tsx` — ฝั่ง public (เต็มหน้า) + ฝั่ง admin (อยู่ในกรอบ AdminShell กดไปหน้าอื่นต่อได้) · ทั้งคู่ log ลง console + โชว์ `digest` **ไม่โชว์ `error.message`** (กันรั่วโครงสร้าง DB/พาธไฟล์)
  - [x] `not-found.tsx` — public (มี Header/Footer + ปุ่มกลับหน้าแรก/ดูข่าว) · admin (“ไม่พบรายการนี้” สำหรับ id ที่ถูกลบ) · root (URL ลึกที่ไม่ match segment ไหน)
  - [x] `global-error.tsx` — ตาข่ายชั้นสุดท้ายตอน root layout พัง · เรนเดอร์ `<html>/<body>` เอง + **inline style ล้วน** (CSS ถูก import ใน layout ที่พังไปแล้ว)
  - [x] skeleton: `loading.tsx` ที่ `/admin` + segment public ที่ไม่มีหน้า detail (`/staff` `/documents` `/calendar` `/contact` `/about` `/search`)
        · หน้าลิสต์ที่มี `[slug]` เป็นลูก (`/news` `/works` `/albums`) ใช้ **`<Suspense>` ในไฟล์หน้า** + `components/public/list-skeleton`
  > 🔥 **เหตุผลที่ไม่วาง `loading.tsx` ครอบ route group (เจอตอนทำ):** `loading.tsx` = Suspense boundary → response กลายเป็น **streaming**
  > → header ส่งไปก่อน เปลี่ยน status ไม่ได้ ⇒ **หน้าที่ `notFound()` ตอบ 200 แทน 404** (Next ใส่ `noindex` ให้แทน = soft 404)
  > **วัดจริงสลับไปกลับ:** มี `(public)/loading.tsx` → `/mua-mua-slug` = **200** · ย้ายออก = **404** · เลือกคง 404 จริงไว้ (phase ก่อน ๆ verify ไว้แล้วว่าเป็น 404) · problems.md 5.12
- [x] Empty states ทุก list — มีครบตั้งแต่ 4.4/4.6 (ข่าว/ผลงาน/อัลบั้ม/เอกสาร/บุคลากร/ค้นหา + ทุกตารางหลังบ้าน) ✅
- [~] ตรวจ responsive ทั้งเว็บ — **public ผ่านแล้ว** (4.5 วัด overflow=0 ที่ 320/360/390/768px ด้วย CDP · 4.6 เจ้าของคลิกจริงทุกหน้า) · ⏸️ **หลังบ้านยังรอเจ้าของทดสอบบนมือถือ**
- [~] A11y — [x] `lang="th"` · alt ครบ (รูปตกแต่งใช้ `alt=""` + `aria-hidden`) · ฟอร์มมี `<Label htmlFor>` + `aria-invalid` ครบ · `aria-current="page"` ที่เมนู public/admin · `aria-busy`/`sr-only` ที่ skeleton
      · [x] **เพิ่มลิงก์ "ข้ามไปยังเนื้อหาหลัก"** (skip link) ทั้ง public + admin — โผล่เมื่อโฟกัสด้วยคีย์บอร์ด + `<main id>` เป็นเป้า
      · ⏸️ contrast/keyboard nav เต็มรูปแบบ (ต้องใช้เครื่องมือวัดจริง เช่น axe) ยังไม่ได้ทำ
- [x] **ธีมสี/ดีไซน์จริง (global tokens)** — ✅ **ลงแล้ว 2026-07-19 (เลื่อนมาทำก่อนกำหนด)** map สีแบรนด์จาก `DESIGN.md §2` เข้า `:root` ใน `app/globals.css` ครบทุก token (primary=คราม `#333D6D`, neutral อมคราม hue 274, ring=คราม, sidebar active=คราม, chart=แบรนด์+ฟ้า/มิ้นต์/เหลือง)
  > เดิม base color = `neutral` (chroma 0 เทาล้วน) → ตอนนี้เป็นสีแบรนด์แล้ว · **มีผลทั้งเว็บทันที รวมหน้า admin** → ⚠️ ต้องคลิกทดสอบหน้า admin ทุกหน้าว่าไม่มีสีเพี้ยน (ยังไม่ได้ทำ)
  > Lightning CSS (Turbopack) downlevel `oklch` → hex fallback ตอน serve (`--primary: #313969` ≈ `#333D6D`) — ปกติ ไม่ใช่บั๊ก
  > ✅ **(2) ฟอนต์ global เสร็จแล้ว (2026-07-23):** `--font-sans`/`--font-heading` + `body` ใน `globals.css` = `Inter → Anuphan → Noto Sans Thai (สำรอง)`
  >    → **admin/auth/public ใช้ฟอนต์ชุดเดียวกันทั้งเว็บแล้ว** · ถอด inline `style` ฟอนต์ที่ `(public)/layout.tsx` ออก (ซ้ำซ้อน)
  > ⏭️ ยังเหลือ: **(1) เปลี่ยนหน้า auth จากสีฝัง hex → token** — **ตั้งใจยังไม่ทำ** เป็นงาน cosmetic ล้วน แตะ ~20 จุด
  >    และค่า token ไม่เท่ากับ hex เดิมเป๊ะ (`#F7F8FB` vs `--background`) → ต้องเทียบด้วยตาหลังแก้ ค่อยทำพร้อมรอบ QA ที่เจ้าของดูหน้าจอจริง
  > จุดเสียบ typography ของ Tiptap: class **`prose-editor`** ใน `components/admin/rich-text-editor.tsx` — ตอนนี้ยังไม่ได้นิยามที่ไหน (class เปล่า รอใส่ style ที่นี่)
- [x] **Accent token (sky/mint/warning) เป็นตัวแปรกลาง** — ✅ **ลงแล้ว 2026-07-19** เพิ่ม `--sky/--mint/--warning` (+ `-foreground` + `-muted`) ใน `:root` + `.dark` และ map ใน `@theme inline` ของ `app/globals.css` → ใช้เป็น utility ได้ทันที (`bg-mint-muted`, `text-sky-foreground`, `bg-warning`, ฯลฯ)
  > **หลักการ:** สถานะ/หมวด/ไอคอนสถิติต่อจากนี้ **ใช้ token เหล่านี้ ไม่ hardcode hex** · `StatusBadge` ยกมาใช้ token แล้ว (มิ้นต์=เผยแพร่, เหลือง=ร่าง แบบ dot+tint ตาม DESIGN.md §4) → มีผลกับ list ข่าว/ผลงาน/กิจกรรม/อัลบั้มทั้งหมด (คลิกทดสอบ badge ให้ครบ)
- [x] **หน้าแดชบอร์ดหลังบ้าน redesign ตาม mockup `Admin Dashboard.dc.html`** — ✅ **ลงแล้ว 2026-07-19** (import จาก Claude Design project ผ่าน design MCP)
  > `app/admin/page.tsx` เขียนใหม่: หัวเรื่องทักทาย + CTA "เพิ่มข่าวใหม่" · การ์ดสถิติ 4 ใบ (ไอคอนไทล์สี) นับจาก **News/MediaWork/User จริง** · badge "เดือนนี้" = `createdAt >= startOfMonth` (ไม่ใส่เลข trend ปลอมแบบ mockup ตามบทเรียน 8.3) · ตารางข่าวล่าสุด 5 รายการ · ทางลัด 4 ปุ่ม (ลิงก์หน้าที่ ready จริง) · ผู้ใช้งานล่าสุด (avatar สีตาม role)
  > `admin-shell.tsx` + `sidebar-nav.tsx`: Brand โลโก้ไทล์ (ไอคอน `School` เหมือน auth — ยังไม่มีไฟล์โลโก้ใน `public/`) · เมนู active = แถบครามซ้าย 3px + พื้นครามอ่อน · overline หัวกลุ่ม · topbar 60px + ปุ่ม "ดูเว็บไซต์" outline
  > ⚠️ **ตั้งใจต่างจาก mockup:** ไม่ใส่ badge เลข "3" ที่เมนูข้อความติดต่อ (ยังไม่มี `ContactMessage` — Phase 4.4.12 ค่อยนับจริง)
  > ✅ verify: tsc + eslint ผ่าน · รัน dev จริง → guest `/admin`=307, login seed=200, `/admin`(auth)=**200** เรนเดอร์ครบทุก section · utility สีใหม่ถูก generate ลง CSS จริง · **ยังไม่ได้คลิกจริง (เจ้าของทดสอบ)**
- [~] **Performance** — ทำรอบแรกแล้ว (2026-07-23) เหลือเรื่อง cache ระดับหน้า
  - [x] **`lib/image-url.ts` `cloudinaryUrl(url, width)`** — แทรก `f_auto,q_auto,w_…,c_limit` ให้ URL Cloudinary ตอนแสดงผล (URL โดเมนอื่นคืนค่าเดิม)
        ใช้ที่ cover-image / การ์ดข่าว-ผลงาน-อัลบั้ม / บุคลากร / hero slider / แกลเลอรี (กริด 400px, lightbox 1600px)
        > **ทำไมไม่ใช้ `next/image`:** URL รูปมาจากโดเมนไหนก็ได้ที่แอดมินวางเอง (Cloudinary/YouTube/Drive/Dropbox) → ต้องประกาศ `remotePatterns` ล่วงหน้าทุกโดเมน ไม่งั้นรูปพัง
  - [x] `loading="lazy"` + `decoding="async"` ทุกรูปที่ไม่ใช่ภาพแรกของหน้า · **hero banner + รูปปกข่าว = `fetchPriority="high"` ไม่ lazy** (ภาพ LCP)
  - [x] YouTube ฝังแบบ lazy อยู่แล้วตั้งแต่ 4.6 (`youtube-embed` ใช้ `loading="lazy"` + nocookie)
  - [x] 🐛 **เก็บหนี้ revalidate:** action ของ news/works/events ไม่เคย `revalidatePath("/")` → เปิด cache เมื่อไร **หน้าแรกจะค้างข่าว/ผลงาน/กิจกรรมเก่า** (หน้าแรกมี 3 บล็อกนี้) → เติมแล้วทั้ง 3 ไฟล์
  - [ ] ⏸️ เปิด cache หน้า public จริง (`cacheComponents` / `revalidate` รายหน้า) — ยังไม่เปิด รอทำพร้อม deploy จะได้วัดผลบนเครื่องจริง
  > **📌 แผน cache (คุยกัน 2026-07-17) — เป้าหมายจริงคือลดภาระ DB + bandwidth Cloudinary ไม่ใช่ "ค่า API"**
  > *(ตรวจแล้ว: ไม่มี API ภายนอกที่คิดเงินต่อ call — Cloudinary free tier 25 credits/เดือน คือตัวที่ต้องระวังสุด)*
  > - **Next 16 = Cache Components** (`cacheComponents: true` ใน `next.config.ts` + `'use cache'` + `cacheLife()`) — **ยังไม่เปิด**
  >   ถ้าไม่เปิดจะใช้โมเดลเดิม ดู `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`
  >   ✅ `revalidatePath()` ที่ใช้ใน `server/actions/news.ts` แล้ว **รองรับทั้งสองโมเดล** ไม่ต้องรื้อ
  > - **cache เฉพาะหน้า public** (4.5/4.6) — หลังบ้าน**ห้าม** cache (แอดมินต้องเห็นข้อมูลสด + คนใช้ไม่กี่คน ไม่คุ้ม)
  > - Cloudinary: ปล่อยให้ CDN ของมัน cache + ใช้ `f_auto`/`q_auto` — อย่า proxy ผ่าน optimizer ซ้ำโดยไม่จำเป็น
- [x] **Security** ✅ *(2026-07-23)*
  - [x] **sanitize HTML จาก Tiptap** — `lib/sanitize.ts` (`sanitize-html`) ครอบทั้ง 3 จุดที่ใช้ `dangerouslySetInnerHTML` (news/works/`[slug]`)
        · allowlist ตามที่ editor สร้างได้จริง · **iframe ยอมเฉพาะโดเมน YouTube** · `javascript:` ถูกตัดด้วย `allowedSchemes` · เติม `rel="noopener noreferrer"` ให้ลิงก์ออกนอกเว็บ
        · **กันตอนแสดงผล ไม่ใช่ตอนบันทึก** → เนื้อหาเก่าใน DB ปลอดภัยด้วย และเปลี่ยนกฎทีหลังไม่ต้องแก้ข้อมูล
        · ✅ verify: insert เนื้อหาอันตรายลง DB จริงแล้วเปิดหน้า → **12/12 เคสผ่าน** (`<script>`/`onerror`/`javascript:`/iframe เว็บอื่น/`onclick`/`<style>` ถูกตัด · h2/strong/li/ลิงก์/iframe YouTube ยังอยู่ = positive control) · ล้าง row ทดสอบแล้ว
  - [x] **rate-limit** — `lib/rate-limit.ts` (sliding window ใน memory) · contact **3 ครั้ง/10 นาที/IP** (อ่าน IP จาก `X-Forwarded-For`) · ไลก์อัลบั้ม **20 ครั้ง/นาที/เบราว์เซอร์** (คีย์ = cookie `visitor_id`)
        · ✅ verify ยิง action ตรง: ครั้งที่ 1–3 `ok:true` · **ครั้งที่ 4–5 ถูกปฏิเสธ + DB มีแค่ 3 แถว** (บล็อกก่อนเขียนจริง) · **IP อื่นยิงได้ปกติ** ⇒ แยกตาม IP จริงไม่ใช่ล็อกทั้งระบบ · ล้างข้อมูลทดสอบแล้ว
        > ⚠️ **ข้อจำกัดที่ต้องรู้:** นับใน memory ของ process → restart แล้วเริ่มใหม่ · หลาย container จะนับแยกกัน (แผน deploy = 1 container จึงพอ · ถ้า scale ค่อยเปลี่ยนไป Redis แก้แค่ไฟล์นี้)
        > ⚠️ `X-Forwarded-For` ปลอมได้ถ้าไม่มี proxy หน้าเว็บ — แผน deploy มี Caddy ซึ่งเขียน header นี้ให้เอง
  - [x] ตรวจ RBAC ทุก Server Action — ทำไปแล้วราย module ใน 4.4 (ทุก action gate + ทดสอบยิงตรง + positive control ครบทุกโมดูล)
- [x] **Deploy: self-host บน Cloud VPS ด้วย Docker + GitHub Actions (CI/CD)** — ✅ **ขึ้นจริงแล้ว 2026-07-25: https://thaingam.greengramhouse.com**
  > 🎉 **deploy สำเร็จครบวงจร (2026-07-25)** — push `main` → Actions build → GHCR → SSH เข้า VPS → `compose up -d` → `migrate deploy` อัตโนมัติ
  > **ทำบนเครื่องจริง:** swap 2 GB (เดิม 0) · `/home/deploy/thaingam-web/` + `.env` (perm 600, สุ่ม `POSTGRES_PASSWORD`/`BETTER_AUTH_SECRET` ใหม่) ·
  >   site block ใน **`/etc/caddy/Caddyfile` ของระบบ** (ไม่ใช้ `docker-compose.caddy.yml` — Caddy เดิมถือ 80/443 อยู่) สำรองไฟล์เดิมก่อนแก้ ·
  >   Let's Encrypt ออกใบรับรองสำเร็จ · migration **15 ตัวลงครบ** · seed SUPER_ADMIN ผ่าน SSH tunnel
  > **✅ verify บนโดเมนจริง:** 13 route สาธารณะ = 200 · `/admin` ไม่มี cookie = 307 · slug มั่ว = **404** ·
  >   `NEXT_PUBLIC_SITE_URL` ฝังถูก (sitemap/`og:url`/`og:image`/robots ชี้โดเมนจริง) ·
  >   🔒 **login endpoint: รหัสถูก → 200 + `role:SUPER_ADMIN` ไม่มี `INVALID_ORIGIN` · รหัสผิด → 401 · cookie เข้า `/admin` → 200** (positive + negative control) ·
  >   RAM 772/1968 MB · swap ยังไม่ถูกแตะ · StockApp ไม่กระทบ
  > 🐛 **build ล้มรอบแรกบน CI ทั้งที่ผ่านบนเครื่อง** — `lib/generated/prisma` ถูก `.gitignore` แต่ stage `builder` copy มาแค่ `node_modules`
  >   → บนเครื่อง `COPY . .` ลากโฟลเดอร์ที่ค้างอยู่เข้าไปกลบปัญหาไว้ · บน CI checkout สะอาด = `Module not found` ที่ `lib/prisma.ts:2`
  >   ✅ แก้: `COPY --from=deps /app/lib/generated ./lib/generated` **หลัง** `COPY . .` · **reproduce + verify ด้วย `git archive`** (จำลอง checkout ของ CI เป๊ะ) · problems.md 8.8
  > 📌 **แผนเดิม/เหตุผลที่ตัดสินใจ (2026-07-22) เก็บไว้ด้านล่างเพื่ออ้างอิง:**
  > ✅ **ไฟล์ครบแล้ว + ทดสอบ image จริงบนเครื่อง (2026-07-23)** — ขั้นตอนลงมือทั้งหมดอยู่ที่ **[`docs/deploy.md`](./deploy.md)**
  > **เจ้าของเคาะแล้ว:** Postgres = container ใน compose · build บน GitHub Actions → GHCR · **VPS + โดเมนพร้อมแล้ว** · reverse proxy รอผลตรวจว่าเครื่องมี nginx/caddy อยู่เดิมหรือไม่
  > **ทำแล้ว:** `next.config.ts` (`output:"standalone"`) · `Dockerfile` (deps→builder→prisma-cli→runner) · `.dockerignore` · `docker-compose.yml` · `docker-compose.caddy.yml` (แยกออกมา เผื่อเครื่องมี proxy เดิม) · `Caddyfile` · `docker-entrypoint.sh` · `.github/workflows/deploy.yml` · `.env.production.example`
  > **🔥 ปลดล็อกปัญหาใหญ่: `next build` ไม่ต้องมี DB แล้ว** — ทำหน้า public ทั้งหมดเป็น `force-dynamic`
  >   → **พิสูจน์แล้ว: `docker stop` DB แล้ว `pnpm build` ผ่าน 31/31 หน้า** (ก่อนแก้ = พังที่ `/about` ทันที) ⇒ GitHub runner build ได้โดยไม่ต้องต่อ DB
  > **✅ verify ที่ทำจริง:** `docker build` ผ่าน → รัน container ต่อ DB จริง → **entrypoint รัน `prisma migrate deploy` สำเร็จ (15 migrations, no pending)** →
  >   หน้าเว็บใน container ตอบ `/`=200 `/news`=200 `/news/[slug]`=200 `/sitemap.xml`=200 `/og.png`=200 · `/admin`=307 · slug มั่ว=**404** ·
  >   **`NEXT_PUBLIC_SITE_URL` ที่ส่งเป็น build arg โผล่ใน sitemap/og:url จริง** · `docker compose config` ผ่านทั้งชุดปกติและชุด +Caddy · image 602 MB
  > **🐛 2 กับดักที่เจอตอนทดสอบ image (แก้แล้ว):**
  >   1. **copy `node_modules/prisma` จาก builder มาใช้ไม่ได้** — pnpm เก็บของจริงใน `.pnpm/` แล้ว symlink → รันแล้ว `MODULE_NOT_FOUND`
  >      → เพิ่ม stage `prisma-cli` ลง CLI ใหม่ที่ `/opt/tools` (อ่านเวอร์ชันที่ติดตั้งจริงจาก stage `deps` ให้ตรงกับ client เป๊ะ)
  >      · ต้องเขียน `pnpm-workspace.yaml` (`allowBuilds`) ในโฟลเดอร์นั้นด้วย ไม่งั้น `ERR_PNPM_IGNORED_BUILDS` · และห้ามใช้ `pnpm init` (ใส่ `devEngines` ที่ corepack ปฏิเสธ)
  >   2. **`prisma.config.ts` `import "dotenv/config"` แต่ standalone ไม่มี dotenv** → entrypoint ตั้ง `NODE_PATH=/opt/tools/node_modules`
  > **📌 seed ครั้งแรกทำจากเครื่องผู้ดูแลผ่าน SSH tunnel** — `prisma/seed.ts` import `@/lib/auth` (source) ซึ่งไม่มีใน image → ถอด `RUN_SEED` ออกจาก entrypoint
  >   แล้วเปิดพอร์ต db ที่ `127.0.0.1:5433` ของ VPS ไว้แทน (เข้าจากอินเทอร์เน็ตไม่ได้) · ขั้นตอนอยู่ใน deploy.md §4
  > ⏸️ **เหลือทำตอนลงเครื่องจริง:** ตั้ง GitHub Secrets · คัดลอก compose/.env ขึ้น VPS · ตัดสินใจเรื่อง proxy · deploy ครั้งแรก + seed แอดมิน
  > **สถาปัตยกรรม:** VPS 1 เครื่อง รัน `docker compose` 3 service → `caddy` (reverse proxy + auto HTTPS) → `app` (Next standalone :3000) → `db` (Postgres + named volume + backup pg_dump)
  > **Flow CI/CD:** push `main` → GitHub Actions `docker build` → push image ขึ้น **GHCR** → SSH เข้า VPS `compose pull && up -d` → `prisma migrate deploy` · build บน runner (ไม่กิน RAM/CPU ของ VPS) · pin image tag ไว้ rollback ได้
  > **ไฟล์ที่ต้องเพิ่ม/แก้:** `next.config.ts` (เพิ่ม `output: "standalone"`) · `Dockerfile` (multi-stage deps→build→runner) · `.dockerignore` · `docker-compose.yml` · `Caddyfile` · `docker-entrypoint.sh` (migrate deploy ก่อน start) · `.github/workflows/deploy.yml` · `.env.production.example`
  > **✅ ข่าวดี Prisma 7 (เช็คโค้ดแล้ว):** query compiler = WASM ฝัง base64 ใน `.js` · `pg` = pure JS (ไม่มี `pg-native`) · generated client = `.ts` ล้วน → ทั้งหมด bundle เข้า `next build` เอง **ไม่ต้อง copy engine binary / ไม่ต้องห่วง openssl/Alpine**
  > **⚠️ กับดักที่ต้องระวังตอนทำ:**
  > - `prisma migrate deploy` + `db seed` ยังต้องมี `prisma` CLI + `prisma/migrations/` + schema ตอน deploy (แยกจาก runtime bundle) → รันเป็น step ใน entrypoint หรือ compose service ชั่วคราว
  > - `NEXT_PUBLIC_*` ฝังตอน **build** ไม่ใช่ runtime → `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`/`_API_KEY` ต้องส่งเป็น **build arg** ตอน `docker build` ไม่งั้น client ได้ค่าว่าง อัปโหลดรูปพัง
  > - `BETTER_AUTH_URL` ต้องเป็นโดเมน https จริง + ตั้ง `trustedOrigins` ให้ตรง ไม่งั้น CSRF ตอบ 403 (เหมือนเคส port 4000 ตอน dev)
  > - Secrets (`DATABASE_URL`/`BETTER_AUTH_SECRET`/`CLOUDINARY_API_SECRET`/`RESEND_API_KEY`) เก็บใน GitHub Secrets + ไฟล์ env บน VPS (ไม่ commit — `.gitignore` กัน `.env*` อยู่แล้ว)
  > 🔥 **ข้อจำกัดที่เพิ่งพิสูจน์ตอน Phase 4.7 (2026-07-23):** `next build` **ต้องมี DATABASE_URL ที่ต่อติดจริง**
  >    หน้า public หลายหน้า (`/about` `/albums` `/calendar` `/contact` `/documents` `/staff` + `/og.png` `/sitemap.xml`) ถูก prerender เป็น static แล้วยิง Prisma ตอน build
  >    → `docker stop` DB แล้ว build = `ECONNREFUSED` prerender `/about` exit 1 · **GitHub Actions runner ไม่มี DB → build พังทันที**
  >    ทางเลือก: (1) ให้ runner ต่อ DB ได้ · (2) ยกหน้าที่ query DB เป็น `force-dynamic` (เสีย static ไป) · (3) build บน VPS ในเครือข่ายเดียวกับ DB · problems.md 8.6
  > **⚠️ อย่าลืม `NEXT_PUBLIC_SITE_URL`** = โดเมน https จริง (build arg) ไม่งั้น sitemap/canonical/OG ชี้ localhost ทั้งเว็บ
  > **❓ รอเคาะก่อนลงมือ:** (1) Postgres = container ใน compose หรือ managed ภายนอก · (2) build→GHCR→pull หรือ build บน VPS · (3) proxy = Caddy / Nginx+certbot / มีอยู่แล้ว · (4) มีโดเมน + VPS พร้อมหรือยัง
- [ ] ✅ verify: รันตาม "Verification" ใน spec หัวข้อ 9 ผ่านครบ → **เว็บสมบูรณ์** 🎉

---

## 📌 สรุปลำดับ (Milestones)

| Sub-phase | ผลลัพธ์ที่จับต้องได้ |
|---|---|
| 4.0 | โปรเจกต์รันได้ + เครื่องมือครบ |
| 4.1 | DB + ตาราง + seed พร้อม |
| 4.2 | login/logout/reset + กัน /admin ได้ |
| 4.3 | โครงหลังบ้าน + component กลางพร้อม reuse |
| 4.4 | จัดการข้อมูลได้ครบทุกโมเดล |
| 4.5 | หน้าแรก + layout สาธารณะเสร็จ |
| 4.6 | หน้าเนื้อหาสาธารณะครบ |
| 4.7 | ค้นหา + SEO |
| 4.8 | ขัดเงา + deploy → **เว็บสมบูรณ์** |

---

## ภาคผนวก A — `.env` keys ที่ต้องมี

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/thaingam"

# Better Auth
BETTER_AUTH_SECRET="<random-32-chars+>"
BETTER_AUTH_URL="http://localhost:4000"   # ต้องตรงกับ port ที่รันจริง ไม่งั้น 403 INVALID_ORIGIN

# Email (Resend)
RESEND_API_KEY=""
EMAIL_FROM="no-reply@thaingam-school.ac.th"

# Cloudinary
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
```
