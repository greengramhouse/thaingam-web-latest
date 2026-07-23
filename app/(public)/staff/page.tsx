import type { Metadata } from "next";
import { UserRound } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { cloudinaryUrl } from "@/lib/image-url";
import { PageHero } from "@/components/public/page-hero";

/**
 * เรนเดอร์ตอนมี request เสมอ — ไม่ prerender ตอน build
 * เหตุผล: หน้านี้ query DB → ถ้าปล่อยเป็น static จะ (1) build พังบน CI ที่ไม่มี DB
 * (2) ข้อมูลค้างตั้งแต่วันที่ deploy จนกว่าจะ revalidate · ดู problems.md 8.6
 */
export const dynamic = "force-dynamic";


export const metadata: Metadata = {
  title: "ทำเนียบบุคลากร",
  description: "คณะผู้บริหาร ครู และบุคลากรทางการศึกษาของโรงเรียนชุมชนวัดไทยงาม",
};

type StaffMember = {
  id: string;
  name: string;
  position: string;
  department: string | null;
  photo: string | null;
};

const OTHER_GROUP = "บุคลากรอื่น ๆ";
// สีแถบหัวกลุ่ม วนตามลำดับกลุ่ม (แบรนด์ → ฟ้า → มิ้นต์)
const BAR_COLORS = ["bg-primary", "bg-sky", "bg-mint"];

export default async function StaffPage() {
  const staff = await prisma.staff.findMany({
    where: { isActive: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { id: true, name: true, position: true, department: true, photo: true },
  });

  // จัดกลุ่มตามแผนก คงลำดับการพบครั้งแรก (staff เรียง order แล้ว → กลุ่มของคนลำดับต้นมาก่อน)
  const groups: { name: string; members: StaffMember[] }[] = [];
  for (const s of staff) {
    const key = s.department?.trim() || OTHER_GROUP;
    let group = groups.find((g) => g.name === key);
    if (!group) {
      group = { name: key, members: [] };
      groups.push(group);
    }
    group.members.push(s);
  }

  return (
    <>
      <PageHero
        breadcrumb="บุคลากร"
        title="ทำเนียบบุคลากร"
        subtitle="คณะผู้บริหาร ครู และบุคลากรทางการศึกษา"
      />

      <div className="mx-auto max-w-[1200px] px-4 py-9 pb-16 sm:px-6">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-6 py-20 text-center">
            <p className="font-semibold">ยังไม่มีข้อมูลบุคลากร</p>
            <p className="text-sm text-muted-foreground">โปรดกลับมาใหม่อีกครั้ง</p>
          </div>
        ) : (
          groups.map((group, gi) => (
            <section key={group.name} className={gi > 0 ? "mt-11" : ""}>
              <h2 className="mb-[18px] flex items-center gap-2.5 text-xl font-semibold">
                <span className={`h-[22px] w-1 rounded-full ${BAR_COLORS[gi % BAR_COLORS.length]}`} aria-hidden="true" />
                {group.name}
              </h2>
              <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
                {group.members.map((m) => (
                  <div
                    key={m.id}
                    className="overflow-hidden rounded-2xl border border-border bg-card pb-5 text-center shadow-sm"
                  >
                    <div className="aspect-square bg-muted">
                      {m.photo ? (
                        // eslint-disable-next-line @next/next/no-img-element -- URL จากโดเมนใดก็ได้ที่แอดมินวาง
                        <img
                          src={cloudinaryUrl(m.photo, 400)}
                          alt={m.name}
                          loading="lazy"
                          decoding="async"
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-muted-foreground">
                          <UserRound className="size-12" aria-hidden="true" />
                        </div>
                      )}
                    </div>
                    <h3 className="mt-4 mb-1 px-3 text-[15.5px] font-semibold leading-snug">{m.name}</h3>
                    <p className="px-3 text-[13px] font-medium text-primary">{m.position}</p>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </>
  );
}
