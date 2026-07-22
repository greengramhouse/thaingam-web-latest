import { extractYoutubeId, youtubeEmbedUrl } from "@/lib/youtube";

/**
 * ฝังวิดีโอ YouTube แบบ nocookie (ลด tracking) — คืน null ถ้าลิงก์ไม่ใช่ YouTube
 * `loading="lazy"` ให้ browser เลื่อน iframe จนใกล้ viewport ค่อยโหลด (perf เพิ่มเติมทำที่ 4.8)
 */
export function YouTubeEmbed({ url, title }: { url: string; title?: string }) {
  const id = extractYoutubeId(url);
  if (!id) return null;

  return (
    <div className="aspect-video overflow-hidden rounded-2xl bg-black">
      <iframe
        src={youtubeEmbedUrl(id)}
        title={title ?? "วิดีโอ"}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        className="size-full"
      />
    </div>
  );
}
