import type { Metadata } from "next";
import { Download, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { documentFileLabel } from "@/lib/document";
import { PageHero } from "@/components/public/page-hero";

/**
 * เรนเดอร์ตอนมี request เสมอ — ไม่ prerender ตอน build
 * เหตุผล: หน้านี้ query DB → ถ้าปล่อยเป็น static จะ (1) build พังบน CI ที่ไม่มี DB
 * (2) ข้อมูลค้างตั้งแต่วันที่ deploy จนกว่าจะ revalidate · ดู problems.md 8.6
 */
export const dynamic = "force-dynamic";


export const metadata: Metadata = {
  title: "เอกสารดาวน์โหลด",
  description: "ศูนย์รวมเอกสาร แบบฟอร์ม และไฟล์ดาวน์โหลดของโรงเรียนชุมชนวัดไทยงาม",
};

type Doc = {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileType: string | null;
  downloadCount: number;
};

const OTHER_CATEGORY = "ทั่วไป";

export default async function DocumentsPage() {
  const documents = await prisma.document.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ category: "asc" }, { createdAt: "desc" }],
    select: { id: true, title: true, description: true, fileUrl: true, fileType: true, downloadCount: true, category: true },
  });

  // จัดกลุ่มตามหมวด (คงลำดับการพบครั้งแรก — เรียง category asc มาแล้ว)
  const groups: { name: string; items: Doc[] }[] = [];
  for (const d of documents) {
    const key = d.category?.trim() || OTHER_CATEGORY;
    let group = groups.find((g) => g.name === key);
    if (!group) {
      group = { name: key, items: [] };
      groups.push(group);
    }
    group.items.push(d);
  }

  return (
    <>
      <PageHero
        breadcrumb="เอกสารดาวน์โหลด"
        title="เอกสารดาวน์โหลด"
        subtitle="ศูนย์รวมเอกสาร แบบฟอร์ม และไฟล์ต่าง ๆ ของโรงเรียน"
      />

      <div className="mx-auto max-w-[900px] px-4 py-9 pb-16 sm:px-6">
        {groups.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card px-6 py-20 text-center">
            <p className="font-semibold">ยังไม่มีเอกสาร</p>
            <p className="text-sm text-muted-foreground">โปรดกลับมาใหม่อีกครั้ง</p>
          </div>
        ) : (
          groups.map((group, gi) => (
            <section key={group.name} className={gi > 0 ? "mt-9" : ""}>
              <h2 className="mb-3.5 flex items-center gap-2.5 text-lg font-semibold">
                <span className="h-[20px] w-1 rounded-full bg-primary" aria-hidden="true" />
                {group.name}
              </h2>
              <div className="flex flex-col gap-3">
                {group.items.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm"
                  >
                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                      <FileText className="size-6" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[15px] font-semibold leading-snug">{d.title}</h3>
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                          {documentFileLabel(d.fileType, d.fileUrl)}
                        </span>
                      </div>
                      {d.description && (
                        <p className="mt-0.5 line-clamp-1 text-[13px] text-muted-foreground">{d.description}</p>
                      )}
                      <p className="mt-0.5 text-[12px] text-muted-foreground tabular-nums">
                        ดาวน์โหลด {d.downloadCount.toLocaleString("th-TH")} ครั้ง
                      </p>
                    </div>
                    {/* `<a>` ธรรมดา ไม่ใช่ <Link> — กัน prefetch ยิงตัวนับตอน hover */}
                    <a
                      href={`/documents/${d.id}/download`}
                      className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      <Download className="size-4" aria-hidden="true" />
                      <span className="hidden sm:inline">ดาวน์โหลด</span>
                    </a>
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
