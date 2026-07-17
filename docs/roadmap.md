# 🗺️ Phase 4 Roadmap & Checklist — Thaingam-web

> แผนลงมือจริง แตกเป็น sub-phase ย่อย พร้อม checklist ตั้งแต่ตั้งโปรเจกต์ → ออกแบบหน้า → เว็บสมบูรณ์
> ใช้คู่กับ [`spec.md`](./spec.md) — ทำไล่ตามลำดับ ติ๊ก `[x]` เมื่อเสร็จแต่ละข้อ
>
> **สถานะ:** ⏸️ รอเจ้าของโปรเจกต์สั่งเริ่มแต่ละ sub-phase

---

## ✅ Checklist ก่อนเริ่ม (Prerequisites)

เตรียมให้พร้อมก่อน Phase 4.2 (Auth) เป็นต้นไป:

- [x] **PostgreSQL** — มี `DATABASE_URL` (PostgreSQL 16 ผ่าน Docker, port 5436)
- [ ] **Google OAuth** — สร้าง OAuth Client แล้วได้ `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET`
      (Authorized redirect URI: `http://localhost:4000/api/auth/callback/google` — **4000 ไม่ใช่ 3000**)
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
**ลำดับปรับใหม่:** ทำ email/password core ก่อน → Google OAuth + reset email เลื่อนไปทำตอนมี credentials (just-in-time)

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
- [ ] Google OAuth — เปิด `socialProviders.google` ใน `lib/auth.ts` เมื่อมี `GOOGLE_CLIENT_ID/SECRET`
- [ ] Reset password (Resend) — เพิ่ม `sendResetPassword` + หน้า `(auth)/forgot-password`, `(auth)/reset-password` เมื่อมี `RESEND_API_KEY`
- [ ] ✅ verify (เพิ่มเติม): Google OAuth login, reset password ส่งอีเมล

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
- [ ] **4.4.2 Categories & Tags** — CRUD + slug อัตโนมัติ
- [ ] **4.4.3 MediaWork** — type (YOUTUBE/VIDEO/ARTICLE) เปลี่ยน field ตาม type, validate youtubeUrl
- [ ] **4.4.4 Events** — date range (multi-day), allDay, color picker, location
- [ ] **4.4.5 Staff** — ทำเนียบบุคลากร + รูป + order (drag/หมายเลข) + isActive
- [ ] **4.4.6 Albums & Photos** — album + upload หลายรูป + จัดลำดับ + ดู likeCount
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
- [ ] **ธีมสี/ดีไซน์จริง** — เลือกสีแบรนด์โรงเรียน + ปรับ tokens (ที่พักไว้ตอนต้น)
  > ตอนนี้ base color = `neutral` → **ทุก token chroma = 0 (เทาล้วน ไม่มีสี)** เช่น `--primary: oklch(0.205 0 0)` vs `--foreground: oklch(0.145 0 0)`
  > ผลคือ **ลิงก์ในเนื้อหาแยกจากข้อความธรรมดาด้วยขีดเส้นใต้อย่างเดียว** (ยืนยันตอนคลิกจริง 2026-07-17 — ไม่ใช่บั๊ก) → พอใส่สีแบรนด์แล้วลิงก์จะเด่นเอง
  > จุดเสียบ typography ของ Tiptap: class **`prose-editor`** ใน `components/admin/rich-text-editor.tsx` — ตอนนี้ยังไม่ได้นิยามที่ไหน (class เปล่า รอใส่ style ที่นี่)
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

# Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Email (Resend)
RESEND_API_KEY=""
EMAIL_FROM="no-reply@thaingam-school.ac.th"

# Cloudinary
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=""
```
