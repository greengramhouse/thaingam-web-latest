import "dotenv/config";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// seed ผ่าน internal API ของ Better Auth (hash password ด้วย scrypt) — เลี่ยง nextCookies ที่เรียก next/headers
const email = process.env.SEED_ADMIN_EMAIL ?? "admin@thaingam-school.ac.th";
const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
const name = process.env.SEED_ADMIN_NAME ?? "ผู้ดูแลระบบ";

async function seedSuperAdmin() {
  const ctx = await auth.$context;

  const existing = await ctx.internalAdapter.findUserByEmail(email);
  if (existing) {
    const existingRole = (existing.user as { role?: string }).role;
    console.log(`↩︎  SUPER_ADMIN มีอยู่แล้ว: ${email} (role=${existingRole})`);
    return;
  }

  const user = await ctx.internalAdapter.createUser({
    email,
    name,
    role: "SUPER_ADMIN",
    emailVerified: true,
  });

  const hash = await ctx.password.hash(password);
  await ctx.internalAdapter.createAccount({
    userId: user.id,
    providerId: "credential",
    accountId: user.id,
    password: hash,
  });

  console.log(`✅ สร้าง SUPER_ADMIN: ${user.email} (role=${user.role})`);
}

// หมวดหมู่ตั้งต้นของข่าว — แก้/เพิ่มได้เองผ่าน /admin/categories (Phase 4.4.2)
const categories = [
  { name: "ข่าวประชาสัมพันธ์", slug: "announcements", description: "ข่าวสารทั่วไปของโรงเรียน" },
  { name: "กิจกรรมโรงเรียน", slug: "activities", description: "กิจกรรมและงานต่าง ๆ" },
  { name: "ผลงานนักเรียน", slug: "student-achievements", description: "รางวัลและความสำเร็จของนักเรียน" },
  { name: "วิชาการ", slug: "academic", description: "ข่าวด้านการเรียนการสอน" },
  { name: "จัดซื้อจัดจ้าง", slug: "procurement", description: "ประกาศจัดซื้อจัดจ้าง" },
];

async function seedCategories() {
  // upsert เพื่อให้รันซ้ำได้ (idempotent) และไม่ทับข้อมูลที่แอดมินแก้ชื่อไปแล้ว
  for (const category of categories) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {},
      create: category,
    });
  }
  console.log(`✅ หมวดหมู่ข่าวตั้งต้น: ${categories.length} รายการ`);
}

// หน้าเนื้อหาตั้งต้น — สร้างเป็น DRAFT + เนื้อหา placeholder ให้แอดมินเข้าไปแก้ (Phase 4.4.10)
// slug ตรงกับ route หน้า public (Phase 4.6) ที่ /[slug] · (ตัด 'admission' ออก — โรงเรียนไม่มีการรับสมัคร)
const pages = [
  { slug: "regulations", title: "ระเบียบโรงเรียน" },
  { slug: "curriculum", title: "หลักสูตร" },
];

async function seedPages() {
  // upsert — รันซ้ำได้ ไม่ทับเนื้อหา/สถานะที่แอดมินแก้ไปแล้ว (update: {})
  for (const page of pages) {
    await prisma.page.upsert({
      where: { slug: page.slug },
      update: {},
      create: {
        slug: page.slug,
        title: page.title,
        content: `<p>ยังไม่มีเนื้อหา — แก้ไขได้ที่เมนู “หน้าเนื้อหา” ในระบบหลังบ้าน</p>`,
        status: "DRAFT",
      },
    });
  }
  console.log(`✅ หน้าเนื้อหาตั้งต้น: ${pages.length} รายการ (DRAFT)`);
}

async function main() {
  await seedSuperAdmin();
  await seedCategories();
  await seedPages();
  // ⏭️ content seed ที่เหลือ (SiteSetting) เพิ่มตอนโมเดลนั้นถูกสร้าง (just-in-time)
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
