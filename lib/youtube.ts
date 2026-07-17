/**
 * ดึง video id จากลิงก์ YouTube — รองรับรูปแบบที่คนก๊อปมาวางจริง
 *
 *   https://www.youtube.com/watch?v=<id>      (ปุ่ม address bar)
 *   https://youtu.be/<id>                     (ปุ่ม Share)
 *   https://www.youtube.com/embed/<id>        (ปุ่ม Embed)
 *   https://www.youtube.com/shorts/<id>       (Shorts)
 *   https://www.youtube.com/live/<id>         (Live)
 *   + m.youtube.com / ไม่มี www / http
 *
 * คืน null ถ้าไม่ใช่ลิงก์ YouTube ที่มี id — ใช้ทั้งตอน validate ฝั่งฟอร์ม
 * และตอนฝัง iframe ในหน้า public (Phase 4.6)
 */
const YOUTUBE_ID = /^[\w-]{11}$/;

export function extractYoutubeId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }

  if (!["http:", "https:"].includes(url.protocol)) return null;

  const host = url.hostname.replace(/^www\./, "");
  const isYoutubeHost = host === "youtube.com" || host === "m.youtube.com" || host === "youtube-nocookie.com";

  // youtu.be/<id>
  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return YOUTUBE_ID.test(id) ? id : null;
  }

  if (!isYoutubeHost) return null;

  // youtube.com/watch?v=<id>
  if (url.pathname === "/watch") {
    const id = url.searchParams.get("v") ?? "";
    return YOUTUBE_ID.test(id) ? id : null;
  }

  // youtube.com/{embed,shorts,live}/<id>
  const [, prefix, id] = url.pathname.split("/");
  if (["embed", "shorts", "live"].includes(prefix) && YOUTUBE_ID.test(id ?? "")) {
    return id;
  }

  return null;
}

export function isYoutubeUrl(input: string): boolean {
  return extractYoutubeId(input) !== null;
}

/** ลิงก์สำหรับฝัง iframe — nocookie ลด tracking (Phase 4.6 จะใช้) */
export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

/** รูปปกอัตโนมัติจาก YouTube — ใช้เป็น thumbnail สำรองเมื่อแอดมินไม่ได้อัปโหลดเอง */
export function youtubeThumbnailUrl(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
