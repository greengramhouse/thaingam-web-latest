# 📘 Project Spec — เว็บไซต์โรงเรียนชุมชนวัดไทยงาม (Thaingam-web)

> เอกสารข้อกำหนดและแผนการพัฒนา (Living Spec) — อัปเดตล่าสุดจากการสัมภาษณ์ requirement รอบแรก

---

## 1. ภาพรวมโปรเจกต์ (Overview)

เว็บไซต์ประชาสัมพันธ์ + ระบบจัดการข้อมูลหลังบ้าน สำหรับ **"โรงเรียนชุมชนวัดไทยงาม"** ประกอบด้วย 2 ส่วนหลัก:

1. **Public Website** — สำหรับบุคคลทั่วไป ครู เจ้าหน้าที่ ผู้ปกครอง นักเรียน เข้ามาดูข่าวสาร ผลงาน/สื่อการสอน ปฏิทินกิจกรรม ข้อมูลวิชาการ การรับสมัคร และข้อมูลโรงเรียน
2. **Admin Backoffice** — ระบบหลังบ้านมีความปลอดภัย ให้ผู้ดูแลจัดการข้อมูล (CRUD) ทั้งหมด

**ภาษา:** ไทยอย่างเดียว (ไม่ทำ i18n)

---

## 2. Tech Stack

| ส่วน | เทคโนโลยี |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| ORM | Prisma 7 (generator `prisma-client` + driver adapter `@prisma/adapter-pg`) |
| Database | PostgreSQL (driver `pg`) |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Package Manager | pnpm |
| Auth | **Better Auth** |
| Rich Text | Tiptap (output HTML) |
| Calendar | FullCalendar |
| Forms/Validation | react-hook-form + Zod |
| File/Media | Cloudinary / Google Drive (เก็บเป็น URL) |

---

## 3. ผู้ใช้และสิทธิ์ (Users & RBAC)

**Roles (3 ระดับ):**

| Role | สิทธิ์ |
|---|---|
| `SUPER_ADMIN` | ทำได้ทุกอย่าง + จัดการผู้ใช้ (สร้าง/กำหนด role) + ตั้งค่าระบบ |
| `ADMIN` | จัดการเนื้อหาทั้งหมด (ข่าว/ผลงาน/กิจกรรม/...) + **เป็นผู้กด Publish** + ตอบข้อความติดต่อ |
| `TEACHER` | **ยังไม่มีสิทธิ์จัดการเนื้อหา** — สงวนไว้สำหรับ "ข้อมูลภายในโรงเรียน" ในอนาคต (ดูด้านล่าง) |

> **📌 ตัดสินใจ 2026-07-16 — ครูไม่โพสต์เนื้อหาเอง:** เนื้อหาสาธารณะทั้งหมด (ข่าว/ผลงาน/กิจกรรม) **ADMIN เป็นคนทำทั้งหมด** ครูไม่ต้อง login เพื่อโพสต์
> Role `TEACHER` ยังคงอยู่ในระบบเพราะอนาคตจะมี **ส่วนข้อมูลภายในที่เห็นได้เฉพาะครู** (เช่น ข้อมูลนักเรียน ผลการเรียน) เพื่อกันไม่ให้นักเรียน/ผู้ปกครองเข้าดู — จะออกแบบเป็น phase แยกภายหลัง

**Authentication (Better Auth):**
- Email/Password (จัดการเอง) + reset/change password ผ่านอีเมล
- Google OAuth (Gmail)
- **ไม่มีหน้าสมัครสมาชิก (register)** — `emailAndPassword.disableSignUp: true` ปิด endpoint `/api/auth/sign-up/email`
  **SUPER_ADMIN เป็นผู้สร้าง user และกำหนดสิทธิ์** ผ่านหน้า `/admin/users` (Phase 4.4.13)
- Publishing workflow: `DRAFT` / `PUBLISHED` — เป็น "ร่าง / เผยแพร่" ของ ADMIN เอง (ไม่ใช่ flow ส่งตรวจข้ามคนแล้ว)

---

## 4. Database Schema (`prisma/schema.prisma`)

> **📐 กลยุทธ์การวาง schema — incremental (just-in-time):** schema ด้านล่างคือ **target ปลายทาง** ไม่ได้วางทั้งก้อนรวดเดียว — วางเฉพาะ model ที่โค้ดโยงไปถึงในแต่ละ phase แล้ว `migrate dev` ทีละครั้ง
> - ✅ **วางแล้ว:** Auth models (`User` `Session` `Account` `Verification`) + enum `Role` (migration `init_auth`)
> - ✅ **วางแล้ว (Phase 4.4.1):** `Category` `Tag` `News` + enum `PublishStatus` + relation `User.news`
> - ⏭️ **รอเพิ่มตอนทำฟีเจอร์นั้น:** content models ที่เหลือ + enum `MediaType` และ relation จาก `User` ไป content (`mediaWorks`/`events`/`pages`) ที่ตัดออกชั่วคราว
>
> **📛 กติกาชื่อตาราง:** ทุกตารางใช้ **ตัวพิมพ์เล็ก** ผ่าน `@@map` (`user` `session` `news` `category` `tag`) — ตาราง auth บังคับโดย Better Auth
> อยู่แล้ว ที่เหลือทำตามให้สม่ำเสมอ (Postgres ไม่ต้อง quote) · ⚠️ join table ของ m-n ยังเป็น `_NewsToTag` เพราะ Prisma ตั้งจาก **ชื่อ model** ไม่ใช่ชื่อตาราง
>
> **ต่างจากบล็อกด้านล่างที่เป็น target เดิม:** `News.authorId` และ `News.categoryId` เป็น **nullable + `onDelete: SetNull`** (ของเดิมบังคับ `authorId`)
> เพื่อให้ลบ user/หมวดหมู่แล้วข่าวไม่หายตามไปด้วย

```prisma
// Prisma 7 — generator ใหม่ `prisma-client` (บังคับระบุ output) + driver adapter (pg)
generator client {
  provider = "prisma-client"
  output   = "../lib/generated/prisma"
}
datasource db {
  provider = "postgresql"
  // ⚠️ Prisma 7: ไม่ใส่ url ที่นี่ — กำหนดผ่าน prisma.config.ts (process.env.DATABASE_URL)
}

// ======================= Enums =======================
enum Role          { SUPER_ADMIN  ADMIN  TEACHER }
enum PublishStatus { DRAFT  PUBLISHED }
enum MediaType     { YOUTUBE  VIDEO  ARTICLE }

// ==================== Better Auth ====================
model User {
  id            String    @id
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  role          Role      @default(TEACHER)
  banned        Boolean?  @default(false)
  banReason     String?
  banExpires    DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
  accounts      Account[]
  news          News[]
  mediaWorks    MediaWork[]
  events        Event[]
  pages         Page[]
  @@map("user")
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String   @unique
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@map("session")
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
  @@map("account")
}

model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  @@map("verification")
}

// ====================== Content ======================
model Category {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  news        News[]
}

model Tag {
  id         String      @id @default(cuid())
  name       String
  slug       String      @unique
  news       News[]
  mediaWorks MediaWork[]
}

model News {
  id          String        @id @default(cuid())
  title       String
  slug        String        @unique
  excerpt     String?
  content     String        // rich text (HTML)
  coverImage  String?       // Cloudinary/Drive URL
  status      PublishStatus @default(DRAFT)
  featured    Boolean       @default(false)
  publishedAt DateTime?
  viewCount   Int           @default(0)
  categoryId  String?
  category    Category?     @relation(fields: [categoryId], references: [id])
  tags        Tag[]
  authorId    String
  author      User          @relation(fields: [authorId], references: [id])
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  @@index([status, publishedAt])
}

model MediaWork {
  id          String        @id @default(cuid())
  title       String
  slug        String        @unique
  description String?
  type        MediaType
  youtubeUrl  String?       // type = YOUTUBE
  videoUrl    String?       // type = VIDEO
  content     String?       // type = ARTICLE (rich text)
  thumbnail   String?
  status      PublishStatus @default(DRAFT)
  featured    Boolean       @default(false)
  publishedAt DateTime?
  tags        Tag[]
  authorId    String
  author      User          @relation(fields: [authorId], references: [id])
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  @@index([type, status])
}

model Event {
  id          String        @id @default(cuid())
  title       String
  description String?
  location    String?
  startDate   DateTime
  endDate     DateTime?     // multi-day
  allDay      Boolean       @default(false)
  color       String?       // hex สำหรับปฏิทิน
  coverImage  String?
  status      PublishStatus @default(PUBLISHED)
  authorId    String
  author      User          @relation(fields: [authorId], references: [id])
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  @@index([startDate])
}

model Staff {
  id         String   @id @default(cuid())
  name       String
  position   String   // ตำแหน่ง
  department String?  // กลุ่มสาระ/ฝ่าย
  photo      String?
  email      String?
  phone      String?
  bio        String?
  order      Int      @default(0)
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  @@index([order])
}

model Page {
  id        String        @id @default(cuid())
  slug      String        @unique // 'regulations' | 'admission' | 'curriculum' ...
  title     String
  content   String        // rich text
  status    PublishStatus @default(PUBLISHED)
  authorId  String?
  author    User?         @relation(fields: [authorId], references: [id])
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
}

model SiteSetting {
  id        String   @id @default(cuid())
  key       String   @unique // 'contact.phone' | 'social.facebook' | 'map.embed' ...
  value     String
  updatedAt DateTime @updatedAt
}

model ContactMessage {
  id        String   @id @default(cuid())
  name      String
  email     String
  phone     String?
  subject   String?
  message   String
  isRead    Boolean  @default(false)
  createdAt DateTime @default(now())
  @@index([isRead, createdAt])
}

// ============ ฟีเจอร์เสริม (เลือกใช้) ============
model Album {
  id          String        @id @default(cuid())
  title       String
  slug        String        @unique
  description String?
  coverImage  String?
  eventDate   DateTime?
  status      PublishStatus @default(PUBLISHED)
  likeCount   Int           @default(0)   // denormalized
  photos      Photo[]
  likes       AlbumLike[]
  authorId    String?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
}

model Photo {
  id      String  @id @default(cuid())
  albumId String
  album   Album   @relation(fields: [albumId], references: [id], onDelete: Cascade)
  url     String  // Cloudinary/Drive
  caption String?
  order   Int     @default(0)
}

// กดไลก์แบบไม่ต้อง login — กันสแปมด้วย fingerprint (IP hash + localStorage visitorId)
model AlbumLike {
  id          String   @id @default(cuid())
  albumId     String
  album       Album    @relation(fields: [albumId], references: [id], onDelete: Cascade)
  fingerprint String
  createdAt   DateTime @default(now())
  @@unique([albumId, fingerprint])
}

model Document {
  id            String        @id @default(cuid())
  title         String
  description   String?
  fileUrl       String        // PDF/ไฟล์ (Cloudinary/Drive)
  fileType      String?       // pdf, docx...
  category      String?       // ประกาศ | แบบฟอร์ม | หลักสูตร...
  status        PublishStatus @default(PUBLISHED)
  downloadCount Int           @default(0)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

model Banner {
  id        String   @id @default(cuid())
  title     String?
  image     String   // Cloudinary/Drive URL
  linkUrl   String?
  order     Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  @@index([order, isActive])
}

model Announcement {
  id        String    @id @default(cuid())
  message   String
  linkUrl   String?
  isActive  Boolean   @default(true)
  startsAt  DateTime?
  endsAt    DateTime?
  createdAt DateTime  @default(now())
}
```

> **🔧 Prisma 7 setup (สำคัญ):**
> - **Generator:** `prisma-client` (ไม่ใช่ `prisma-client-js` เดิม) — บังคับระบุ `output`; generated client อยู่ที่ `lib/generated/prisma` (gitignore ไว้ → รัน `pnpm prisma generate` หลัง clone)
> - **Config:** `prisma.config.ts` ที่ root — โหลด `dotenv/config` + ป้อน `DATABASE_URL` เข้า datasource (แทน `url = env(...)` ใน schema)
> - **Driver adapter:** ใช้ `@prisma/adapter-pg` + `pg` — `lib/prisma.ts` สร้าง `PrismaPg` adapter แล้วส่งเข้า `new PrismaClient({ adapter })`
> - **Import client:** `import { PrismaClient } from "@/lib/generated/prisma/client"`
> - **Seed:** รันด้วย `tsx` (กำหนดใน `prisma.config.ts` → `migrations`/`seed`)

---

## 5. Architecture & Folder Structure

**หลักการ:**
- **Mutations:** ใช้ **Server Actions** (`server/actions/`) + Zod validation; API route ใช้เฉพาะ Better Auth
- **Auth guard:** `proxy.ts` *(Next.js 16 เปลี่ยนชื่อจาก `middleware.ts`)* — optimistic check session ก่อนเข้า `/admin`; layout ของ admin + Server Actions เช็ค role ซ้ำอีกชั้น (authorization จริง)
- **RBAC:** ตามตารางหัวข้อ 3
- **Media:** เก็บ URL เท่านั้น (Cloudinary/Drive) ไม่มีไฟล์บน server

```
Thaingam-web/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/             # Prisma migrations
│   └── seed.ts                  # seed SUPER_ADMIN + categories + siteSettings (รันด้วย tsx)
├── prisma.config.ts            # Prisma 7 config (dotenv + DATABASE_URL, schema/migrations/seed)
├── docs/
│   └── spec.md                  # เอกสารนี้
├── public/
├── proxy.ts                    # (Next 16: เดิม middleware.ts) optimistic guard /admin (root — ไม่มี src/)
├── app/
│   ├── (public)/            # route group เว็บสาธารณะ (Navbar/Footer)
│   │   ├── layout.tsx
│   │   ├── page.tsx                 # หน้าแรก
│   │   ├── news/
│   │   │   ├── page.tsx             # รายการข่าว (+filter category/tag)
│   │   │   └── [slug]/page.tsx      # อ่านข่าว
│   │   ├── works/                   # ผลงาน/สื่อการสอน (MediaWork)
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx      # ฝัง YouTube/วิดีโอ
│   │   ├── calendar/page.tsx        # ปฏิทินกิจกรรม (FullCalendar)
│   │   ├── albums/                  # อัลบั้มภาพกิจกรรม (+ like, lightbox)
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── documents/page.tsx       # ศูนย์ดาวน์โหลดเอกสาร
│   │   ├── staff/page.tsx           # ทำเนียบบุคลากร
│   │   ├── admission/page.tsx       # การรับสมัคร (Page DB)
│   │   ├── about/page.tsx           # เกี่ยวกับโรงเรียน
│   │   ├── contact/page.tsx         # ติดต่อ + ฟอร์ม + Google Map
│   │   ├── search/page.tsx          # ค้นหาทั่วเว็บ
│   │   └── [slug]/page.tsx          # Page อื่น ๆ จาก DB (ระเบียบ/หลักสูตร)
│   │
│   ├── (auth)/              # login / reset (ไม่มี Navbar หลัก)
│   │   ├── login/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   │
│   ├── admin/              # Backoffice (proxy + layout guard)
│   │   ├── layout.tsx               # Sidebar + Topbar + auth guard
│   │   ├── page.tsx                 # Dashboard (สถิติ)
│   │   ├── news/  works/  events/
│   │   ├── albums/  documents/  banners/  announcements/
│   │   ├── staff/  pages/  categories/
│   │   ├── messages/  settings/
│   │   └── users/                   # เฉพาะ SUPER_ADMIN
│   │
│   ├── sitemap.ts   robots.ts       # SEO
│   └── api/auth/[...all]/route.ts   # Better Auth handler
│
├── components/
│   ├── ui/                  # shadcn/ui
│   ├── public/             # Navbar, Footer, NewsCard, YouTubeEmbed, EventCalendar, AlbumLike...
│   ├── admin/              # Sidebar, DataTable, RichTextEditor(Tiptap), ImageUrlInput...
│   └── shared/
│
├── lib/
│   ├── auth.ts             # Better Auth server config
│   ├── auth-client.ts      # Better Auth client
│   ├── prisma.ts           # Prisma singleton (PrismaPg adapter + generated client)
│   ├── generated/prisma/   # generated Prisma Client (gitignore — รัน prisma generate)
│   ├── validations/        # Zod schemas
│   └── utils.ts
│
├── server/actions/        # Server Actions ต่อฟีเจอร์
└── hooks/  types/
```

> **หมายเหตุ:** โปรเจกต์นี้ **ไม่ใช้ `src/`** โค้ดทั้งหมด (`app/`, `components/`, `lib/`, `server/`, `hooks/`, `types/`, `proxy.ts`) วางที่ root ของโปรเจกต์ — alias `@/*` ชี้ไปที่ root (`./*`)

---

## 6. UI/UX & Components

**Layouts:**
- **Public** — `Navbar` (โลโก้ + เมนู + mobile drawer + ปุ่มค้นหา), `Footer` (ติดต่อ/แผนที่/social จาก SiteSetting)
- **Admin** — `Sidebar` (เมนูตาม role, ซ่อน users/settings สำหรับ non-SUPER_ADMIN), `Topbar` (user + logout)
- **Auth** — เรียบ กลางจอ

**หน้าแรก (sections):** Hero Slider (Banner) → แถบประกาศด่วน → ข่าวเด่น → ข่าวล่าสุด → ผลงานเด่น → กิจกรรมเร็ว ๆ นี้ → CTA รับสมัคร → Footer

**shadcn/ui ที่ต้องติดตั้ง:**
`button` `input` `textarea` `label` `form` `card` `dialog` `dropdown-menu` `select` `table` `badge` `avatar` `tabs` `sheet` `sonner` `alert-dialog` `skeleton` `separator` `switch` `checkbox` `popover` `calendar` `pagination` `tooltip` `navigation-menu` `scroll-area` `command`

**ไลบรารีเสริม:** `@tiptap/react` (+ starter-kit, image, link, youtube), `@fullcalendar/*`, `zod`, `react-hook-form`, `@hookform/resolvers`, `next-cloudinary`

> ⏭️ **หมายเหตุการติดตั้ง:** `@tiptap/*` และ `@fullcalendar/*` **ไม่ติดตั้งตอน scaffold (Phase 4.0)** — เลื่อนไปติดตั้งตอนลงมือทำฟีเจอร์นั้นจริง: Tiptap → Phase 4.3 (RichTextEditor), FullCalendar → Phase 4.6 (หน้าปฏิทิน)

**ธีมสี/ดีไซน์:** พักไว้ก่อน — ทำ neutral ไปก่อน แล้วค่อยปรับภายหลัง

---

## 7. ฟีเจอร์เสริมที่เลือก

- **อัลบั้มภาพกิจกรรม** — จัดเป็นอัลบั้ม + lightbox + **กดไลก์ได้** (ไม่ต้อง login, กันสแปมด้วย fingerprint)
- **ศูนย์ดาวน์โหลดเอกสาร** — ประกาศ/แบบฟอร์ม PDF แยกหมวด + นับ downloadCount
- **Hero Slider** — แบนเนอร์หน้าแรกจัดการผ่าน admin
- **แถบประกาศด่วน** — Announcement bar บนสุดของหน้าแรก
- **SEO Package** — `generateMetadata` + OpenGraph, `sitemap.ts`, `robots.ts`, JSON-LD (School)
- **ค้นหาทั่วเว็บ** — หน้า `/search` ค้น News/MediaWork/Page (Prisma `contains` insensitive)

---

## 8. แผนพัฒนา — Phase 4: Feature Implementation

> ⏸️ **ยังไม่ลงมือ — รอเจ้าของโปรเจกต์สั่งเริ่มเอง** ทำทีละ step ตามลำดับ
> 📋 รายละเอียด sub-phase + checklist ครบ ดูที่ [`roadmap.md`](./roadmap.md)

| # | Step | รายละเอียด |
|---|---|---|
| 1 | **Scaffold** | `pnpm create next-app` (TS, App Router, Tailwind v4), init shadcn/ui, ติดตั้ง deps พื้นฐาน *(Tiptap เลื่อนไป step 4, FullCalendar เลื่อนไป step 6)* |
| 2 | **DB** | วาง `schema.prisma`, ตั้ง `DATABASE_URL`, `prisma migrate dev`, `lib/prisma.ts` |
| 3 | **Auth** | Better Auth config (Email/Password core ก่อน; reset email + Google OAuth เลื่อนตอนมี creds), role, `proxy.ts` *(เดิม middleware.ts)*, seed SUPER_ADMIN |
| 4 | **Admin shell** | layout (Sidebar/Topbar ตาม role), Dashboard, RBAC helper, RichTextEditor, ImageUrlInput, DataTable |
| 5 | **Admin CRUD** | News → Categories/Tags → MediaWork → Events → Staff → Albums/Photos → Documents → Banners → Announcements → Pages → SiteSettings → Messages → Users *(ADMIN+ จัดการเนื้อหาทั้งหมด, Users เฉพาะ SUPER_ADMIN)* |
| 6 | **Public site** | Navbar/Footer, หน้าแรก, news, works (+YouTube), calendar, albums (+like), documents, staff, admission/pages, about, contact (form + Map) |
| 7 | **Search + SEO** | `/search`, metadata, sitemap, robots, JSON-LD |
| 8 | **Polish** | loading/skeleton, 404, empty states, responsive, ธีมสี |

---

## 9. Verification (เกณฑ์ตรวจรับ)

- `pnpm prisma migrate dev` ผ่าน + `prisma studio` เห็นตารางครบ
- `pnpm dev` → login admin ได้; ADMIN สร้างข่าวเป็น DRAFT → กด publish → ข่าวขึ้นหน้า public
- `POST /api/auth/sign-up/email` ต้องถูกปฏิเสธ (ไม่มีสมัครเอง); SUPER_ADMIN สร้าง user ผ่าน `/admin/users` ได้
- YouTube embed เล่นได้ / ปฏิทินแสดง event (multi-day + สี)
- กดไลก์อัลบั้มได้ (กันซ้ำ) / ดาวน์โหลดเอกสาร (count เพิ่ม) / ค้นหาเจอ
- `/sitemap.xml` + `/robots.txt` ตอบถูกต้อง
- reset password ส่งอีเมลได้ / Google OAuth login ได้ / `proxy.ts` กัน non-admin ออกจาก `/admin`

---

## 10. สิ่งที่ผู้ใช้ต้องเตรียม (Prerequisites)

- **PostgreSQL** (`DATABASE_URL`) — local หรือ Neon/Supabase
- **Google OAuth** client (Client ID / Secret)
- **SMTP/Email provider** สำหรับ reset password — เช่น Resend
- **Cloudinary** account (cloud name / API key) หรือวิธีทำลิงก์ตรงจาก Google Drive

---

## สถานะ requirement

✅ Phase 1 (Schema) · ✅ Phase 2 (Architecture) · ✅ Phase 3 (UI/Components) · ✅ ฟีเจอร์เสริม
⏸️ Phase 4 (Implementation) — **พร้อมเริ่ม รอคำสั่งจากเจ้าของโปรเจกต์**
