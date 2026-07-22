"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleAlbumLike } from "@/server/actions/album-like";

/** ปุ่มไลก์อัลบั้ม — optimistic (สลับทันที) แล้ว sync ค่าจริงจาก server ทีหลัง */
export function AlbumLikeButton({
  albumId,
  initialLiked,
  initialCount,
}: {
  albumId: string;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount((c) => Math.max(0, c + (nextLiked ? 1 : -1)));

    startTransition(async () => {
      const res = await toggleAlbumLike(albumId);
      setLiked(res.liked);
      setCount(res.likeCount);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={liked}
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-xl border px-5 text-sm font-semibold transition-colors disabled:opacity-70",
        liked
          ? "border-transparent bg-destructive/10 text-destructive"
          : "border-border bg-card text-foreground hover:bg-accent",
      )}
    >
      <Heart className={cn("size-4", liked && "fill-current")} aria-hidden="true" />
      <span>ถูกใจ</span>
      <span className="tabular-nums">{count.toLocaleString("th-TH")}</span>
    </button>
  );
}
