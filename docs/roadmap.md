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
  - [ ] SiteSetting / Page เริ่มต้น → เพิ่มตอน content models นั้นถูกสร้าง (just-in-time, Phase 4.4.10+)
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
- [ ] **4.4.7 Documents** — ศูนย์ดาวน์โหลด + fileUrl + หมวด
- [ ] **4.4.8 Banners** — Hero slider (order, isActive, link)
- [ ] **4.4.9 Announcements** — แถบประกาศด่วน (active, ช่วงเวลา)
- [ ] **4.4.10 Pages** — แก้เนื้อหา rich text หน้า DB (ระเบียบ/หลักสูตร/รับสมัคร)
- [ ] **4.4.11 SiteSettings** — ฟอร์ม key-value (ติดต่อ/social/map)
- [ ] **4.4.12 ContactMessages** — inbox, mark read, ลบ
- [ ] **4.4.13 Users** *(เฉพาะ SUPER_ADMIN)* — สร้าง user, กำหนด role, ban/unban, reset
      *(ทางเดียวที่จะมี user ใหม่ เพราะปิดสมัครเองแล้ว → ใช้ `authClient.admin.createUser`)*
- [ ] ✅ verify: ADMIN สร้าง DRAFT → กด publish → ขึ้นหน้า public; TEACHER เข้าเมนูเนื้อหาไม่ได้

---

## Phase 4.5 — Public Site Foundation & Homepage

**เป้าหมาย:** โครงหน้าเว็บสาธารณะ + หน้าแรกสมบูรณ์

- [ ] `app/(public)/layout.tsx` — Navbar + Footer + AnnouncementBar
- [ ] `components/public/Navbar.tsx` — โลโก้ + เมนู + `navigation-menu` + mobile drawer (`sheet`) + ปุ่มค้นหา (`command`)
- [ ] `components/public/Footer.tsx` — ข้อมูลจาก SiteSetting + แผนที่ + social
- [ ] `components/public/AnnouncementBar.tsx` — ประกาศด่วน (active + ช่วงเวลา)
- [ ] **หน้าแรก** `app/(public)/page.tsx` — ตาม Page Design Playbook:
  - [ ] Hero Slider (Banner)
  - [ ] ข่าวเด่น (featured) + ข่าวล่าสุด
  - [ ] ผลงาน/สื่อการสอนเด่น
  - [ ] กิจกรรมเร็ว ๆ นี้ (จาก Event)
  - [ ] CTA รับสมัคร
- [ ] ✅ verify: หน้าแรกแสดงข้อมูลจริงจาก DB ครบทุก section + responsive

---

## Phase 4.6 — Public Feature Pages

**เป้าหมาย:** หน้าเนื้อหาสาธารณะครบ (ทำตาม Playbook ทุกหน้า)

- [ ] **ข่าว** `/news` (list + filter category/tag + pagination) & `/news/[slug]` (+ viewCount++, related)
  > ⚠️ **ต้องตัดสินใจเรื่อง `viewCount++` ตั้งแต่ตอนออกแบบหน้านี้** — มันคือการ **write ทุก view**
  > ซึ่งขัดกับการ cache หน้าโดยตรง (cache แล้วนับไม่ขึ้น / นับแล้ว cache ไม่ได้)
  > ทางเลือก: Server Action ยิงแยกหลัง render · route handler เบา ๆ · หรือ batch/นับแบบ approximate
  > ถ้าไม่คิดก่อน จะได้หน้าข่าวที่ cache ไม่ได้เลยทั้งที่เป็นหน้า traffic สูงสุดของเว็บ
- [ ] **ผลงาน** `/works` (grid) & `/works/[slug]` — **YouTubeEmbed** เล่นในหน้า / video / article
- [ ] **ปฏิทิน** `/calendar` — FullCalendar (month/list, สี event, คลิกดูรายละเอียด) — **ติดตั้ง FullCalendar deps ที่นี่** (`@fullcalendar/react @fullcalendar/daygrid @fullcalendar/list @fullcalendar/interaction`) *(เลื่อนมาจาก 4.0)*
- [ ] **อัลบั้ม** `/albums` & `/albums/[slug]` — lightbox + **ปุ่มกดไลก์** (Server Action + fingerprint กันซ้ำ, optimistic UI)
- [ ] **เอกสาร** `/documents` — list ตามหมวด + ปุ่มดาวน์โหลด (downloadCount++)
- [ ] **บุคลากร** `/staff` — การ์ดเรียงตาม order/แผนก
- [ ] **รับสมัคร / ระเบียบ / หลักสูตร** — render จาก `Page` (DB) ผ่าน `/[slug]`
- [ ] **เกี่ยวกับ** `/about` — hardcode + ดึง SiteSetting บางส่วน
- [ ] **ติดต่อ** `/contact` — ฟอร์ม (สร้าง ContactMessage) + Google Map embed + ข้อมูลติดต่อ
- [ ] ✅ verify: ทุกหน้าเปิดได้ มี 4 states, mobile ใช้งานได้

---

## Phase 4.7 — Search & SEO

**เป้าหมาย:** ค้นเจอ + Google เก็บ index ได้

- [ ] `/search` — ค้น News/MediaWork/Page (Prisma `contains`, insensitive) + ปุ่มค้นบน Navbar
- [ ] `generateMetadata` ต่อหน้า (title/description/OG) — โดยเฉพาะ news/works/albums detail
- [ ] `app/sitemap.ts` (รวม dynamic slugs ที่ PUBLISHED)
- [ ] `app/robots.ts`
- [ ] JSON-LD (`School` / `Article`) ในหน้าเกี่ยวข้อง
- [ ] OG image (static หรือ dynamic `opengraph-image`)
- [ ] ✅ verify: `/sitemap.xml`, `/robots.txt` ถูกต้อง, ค้นหาเจอ, preview OG ผ่าน

---

## Phase 4.8 — Polish, QA & Deploy

**เป้าหมาย:** ขัดเงา + ปล่อยจริง

- [ ] Loading (`loading.tsx` + skeleton), `error.tsx`, `not-found.tsx` ครบทุก route group
- [ ] Empty states ทุก list
- [ ] ตรวจ responsive ทั้งเว็บ (mobile/tablet/desktop)
- [ ] A11y: alt, focus, contrast, keyboard, aria
- [x] **ธีมสี/ดีไซน์จริง (global tokens)** — ✅ **ลงแล้ว 2026-07-19 (เลื่อนมาทำก่อนกำหนด)** map สีแบรนด์จาก `DESIGN.md §2` เข้า `:root` ใน `app/globals.css` ครบทุก token (primary=คราม `#333D6D`, neutral อมคราม hue 274, ring=คราม, sidebar active=คราม, chart=แบรนด์+ฟ้า/มิ้นต์/เหลือง)
  > เดิม base color = `neutral` (chroma 0 เทาล้วน) → ตอนนี้เป็นสีแบรนด์แล้ว · **มีผลทั้งเว็บทันที รวมหน้า admin** → ⚠️ ต้องคลิกทดสอบหน้า admin ทุกหน้าว่าไม่มีสีเพี้ยน (ยังไม่ได้ทำ)
  > Lightning CSS (Turbopack) downlevel `oklch` → hex fallback ตอน serve (`--primary: #313969` ≈ `#333D6D`) — ปกติ ไม่ใช่บั๊ก
  > ⏭️ ยังเหลือ: (1) เปลี่ยนหน้า auth จากสีฝัง hex → token (โค้ดสะอาดขึ้น ไม่เปลี่ยนหน้าตา) · (2) ฟอนต์ global `Inter/Anuphan` (ตอนนี้ auth ใช้แล้ว แต่ admin ยัง Noto)
  > จุดเสียบ typography ของ Tiptap: class **`prose-editor`** ใน `components/admin/rich-text-editor.tsx` — ตอนนี้ยังไม่ได้นิยามที่ไหน (class เปล่า รอใส่ style ที่นี่)
- [x] **Accent token (sky/mint/warning) เป็นตัวแปรกลาง** — ✅ **ลงแล้ว 2026-07-19** เพิ่ม `--sky/--mint/--warning` (+ `-foreground` + `-muted`) ใน `:root` + `.dark` และ map ใน `@theme inline` ของ `app/globals.css` → ใช้เป็น utility ได้ทันที (`bg-mint-muted`, `text-sky-foreground`, `bg-warning`, ฯลฯ)
  > **หลักการ:** สถานะ/หมวด/ไอคอนสถิติต่อจากนี้ **ใช้ token เหล่านี้ ไม่ hardcode hex** · `StatusBadge` ยกมาใช้ token แล้ว (มิ้นต์=เผยแพร่, เหลือง=ร่าง แบบ dot+tint ตาม DESIGN.md §4) → มีผลกับ list ข่าว/ผลงาน/กิจกรรม/อัลบั้มทั้งหมด (คลิกทดสอบ badge ให้ครบ)
- [x] **หน้าแดชบอร์ดหลังบ้าน redesign ตาม mockup `Admin Dashboard.dc.html`** — ✅ **ลงแล้ว 2026-07-19** (import จาก Claude Design project ผ่าน design MCP)
  > `app/admin/page.tsx` เขียนใหม่: หัวเรื่องทักทาย + CTA "เพิ่มข่าวใหม่" · การ์ดสถิติ 4 ใบ (ไอคอนไทล์สี) นับจาก **News/MediaWork/User จริง** · badge "เดือนนี้" = `createdAt >= startOfMonth` (ไม่ใส่เลข trend ปลอมแบบ mockup ตามบทเรียน 8.3) · ตารางข่าวล่าสุด 5 รายการ · ทางลัด 4 ปุ่ม (ลิงก์หน้าที่ ready จริง) · ผู้ใช้งานล่าสุด (avatar สีตาม role)
  > `admin-shell.tsx` + `sidebar-nav.tsx`: Brand โลโก้ไทล์ (ไอคอน `School` เหมือน auth — ยังไม่มีไฟล์โลโก้ใน `public/`) · เมนู active = แถบครามซ้าย 3px + พื้นครามอ่อน · overline หัวกลุ่ม · topbar 60px + ปุ่ม "ดูเว็บไซต์" outline
  > ⚠️ **ตั้งใจต่างจาก mockup:** ไม่ใส่ badge เลข "3" ที่เมนูข้อความติดต่อ (ยังไม่มี `ContactMessage` — Phase 4.4.12 ค่อยนับจริง)
  > ✅ verify: tsc + eslint ผ่าน · รัน dev จริง → guest `/admin`=307, login seed=200, `/admin`(auth)=**200** เรนเดอร์ครบทุก section · utility สีใหม่ถูก generate ลง CSS จริง · **ยังไม่ได้คลิกจริง (เจ้าของทดสอบ)**
- [ ] Performance: `next/image`, lazy YouTube, cache/revalidate ที่เหมาะสม
  > **📌 แผน cache (คุยกัน 2026-07-17) — เป้าหมายจริงคือลดภาระ DB + bandwidth Cloudinary ไม่ใช่ "ค่า API"**
  > *(ตรวจแล้ว: ไม่มี API ภายนอกที่คิดเงินต่อ call — Cloudinary free tier 25 credits/เดือน คือตัวที่ต้องระวังสุด)*
  > - **Next 16 = Cache Components** (`cacheComponents: true` ใน `next.config.ts` + `'use cache'` + `cacheLife()`) — **ยังไม่เปิด**
  >   ถ้าไม่เปิดจะใช้โมเดลเดิม ดู `node_modules/next/dist/docs/01-app/02-guides/caching-without-cache-components.md`
  >   ✅ `revalidatePath()` ที่ใช้ใน `server/actions/news.ts` แล้ว **รองรับทั้งสองโมเดล** ไม่ต้องรื้อ
  > - **cache เฉพาะหน้า public** (4.5/4.6) — หลังบ้าน**ห้าม** cache (แอดมินต้องเห็นข้อมูลสด + คนใช้ไม่กี่คน ไม่คุ้ม)
  > - Cloudinary: ปล่อยให้ CDN ของมัน cache + ใช้ `f_auto`/`q_auto` — อย่า proxy ผ่าน optimizer ซ้ำโดยไม่จำเป็น
- [ ] Security: rate-limit ฟอร์ม contact/like, sanitize HTML จาก Tiptap, ตรวจ RBAC ทุก Server Action
- [ ] ตั้งค่า production env + migrate + seed บน hosting (Vercel + Neon/Supabase)
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
