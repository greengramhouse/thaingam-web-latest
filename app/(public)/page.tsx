import { Hero } from "@/components/public/hero";
import { QuickLinks } from "@/components/public/quick-links";
import { NewsSection } from "@/components/public/news-section";
import { WorksSection } from "@/components/public/works-section";
import { EventsSection } from "@/components/public/events-section";
import { CtaSection } from "@/components/public/cta-section";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const now = new Date();

  const [banners, news, works, events] = await Promise.all([
    prisma.banner.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      select: { id: true, image: true, title: true, linkUrl: true },
    }),
    // ข่าวเด่นขึ้นก่อน แล้วใหม่สุด — 1 ใบแรก = การ์ดใหญ่, อีก 4 = การ์ดเล็ก
    prisma.news.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      take: 5,
      select: {
        slug: true,
        title: true,
        excerpt: true,
        coverImage: true,
        publishedAt: true,
        createdAt: true,
        category: { select: { name: true } },
      },
    }),
    prisma.mediaWork.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      take: 3,
      select: { slug: true, title: true, type: true, youtubeUrl: true, thumbnail: true },
    }),
    prisma.event.findMany({
      where: {
        status: "PUBLISHED",
        OR: [{ startDate: { gte: startOfToday } }, { endDate: { gte: now } }],
      },
      orderBy: { startDate: "asc" },
      take: 3,
      select: { id: true, title: true, startDate: true, allDay: true, location: true, color: true },
    }),
  ]);

  return (
    <>
      <Hero banners={banners} />
      <QuickLinks />
      <NewsSection items={news} />
      <WorksSection works={works} />
      <EventsSection events={events} />
      <CtaSection />
    </>
  );
}
