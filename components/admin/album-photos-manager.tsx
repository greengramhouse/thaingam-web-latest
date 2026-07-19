"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget, type CloudinaryUploadWidgetResults } from "next-cloudinary";
import { ArrowDown, ArrowUp, ImageUp, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { addPhotos, deletePhoto, movePhoto, updatePhotoCaption } from "@/server/actions/album";

type Photo = { id: string; url: string; caption: string | null; order: number };

export function AlbumPhotosManager({ albumId, photos }: { albumId: string; photos: Photo[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  function run(action: () => Promise<{ ok: boolean; error?: string }>, successMsg?: string) {
    startTransition(async () => {
      const result = await action();
      if (!result.ok) {
        toast.error(result.error ?? "ทำรายการไม่สำเร็จ");
        return;
      }
      if (successMsg) toast.success(successMsg);
      router.refresh();
    });
  }

  function handleUploaded(urls: string[]) {
    if (urls.length === 0) return;
    run(() => addPhotos(albumId, urls), `เพิ่ม ${urls.length} รูปแล้ว`);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">รูปในอัลบั้ม ({photos.length})</CardTitle>
        <PhotoUploadButton onUploaded={handleUploaded} disabled={isPending} />
      </CardHeader>
      <CardContent>
        {photos.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border p-10 text-center">
            <ImageUp className="size-6 text-muted-foreground" aria-hidden="true" />
            <p className="text-sm font-medium">ยังไม่มีรูปในอัลบั้มนี้</p>
            <p className="text-xs text-muted-foreground">กด “เพิ่มรูป” เพื่ออัปโหลด (เลือกได้หลายรูปพร้อมกัน)</p>
          </div>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {photos.map((photo, index) => (
              <li key={photo.id} className="flex gap-3 rounded-md border border-border p-2">
                {/* <img> ไม่ใช่ next/image — URL อาจมาจากโดเมนไหนก็ได้ */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt=""
                  className="size-20 shrink-0 rounded object-cover"
                />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Input
                    defaultValue={photo.caption ?? ""}
                    placeholder="คำบรรยาย (ไม่บังคับ)"
                    aria-label="คำบรรยายรูป"
                    disabled={isPending}
                    onBlur={(e) => {
                      const next = e.target.value;
                      if (next !== (photo.caption ?? "")) {
                        run(() => updatePhotoCaption(photo.id, next), "บันทึกคำบรรยายแล้ว");
                      }
                    }}
                  />
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={isPending || index === 0}
                      onClick={() => run(() => movePhoto(photo.id, "up"))}
                      aria-label="เลื่อนขึ้น"
                      title="เลื่อนขึ้น"
                    >
                      <ArrowUp />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={isPending || index === photos.length - 1}
                      onClick={() => run(() => movePhoto(photo.id, "down"))}
                      aria-label="เลื่อนลง"
                      title="เลื่อนลง"
                    >
                      <ArrowDown />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      disabled={isPending}
                      onClick={() => setDeleteTarget(photo.id)}
                      aria-label="ลบรูป"
                      title="ลบรูป"
                      className="ml-auto text-destructive"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="ลบรูปนี้?"
        description="รูปจะถูกลบออกจากอัลบั้มถาวร"
        confirmLabel="ลบรูป"
        onConfirm={() => {
          const id = deleteTarget;
          if (id) run(() => deletePhoto(id), "ลบรูปแล้ว");
        }}
      />
    </Card>
  );
}

/**
 * ปุ่มเพิ่มรูป — mount `CldUploadWidget` (multiple) เฉพาะหลังกด (lazy) กัน iframe แย่ง focus
 * เก็บ URL ที่อัปสำเร็จไว้ใน ref แล้ว flush ทั้งชุดตอน onQueuesEnd (คิวหมด) → เรียก addPhotos ครั้งเดียว
 */
function PhotoUploadButton({
  onUploaded,
  disabled,
}: {
  onUploaded: (urls: string[]) => void;
  disabled?: boolean;
}) {
  const [active, setActive] = useState(false);
  const collected = useRef<string[]>([]);

  if (!active) {
    return (
      <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={() => setActive(true)}>
        <ImageUp aria-hidden="true" />
        เพิ่มรูป
      </Button>
    );
  }

  function handleSuccess(result: CloudinaryUploadWidgetResults) {
    const info = result.info;
    if (info && typeof info !== "string") collected.current.push(info.secure_url);
  }

  function flush() {
    const urls = collected.current;
    collected.current = [];
    if (urls.length) onUploaded(urls);
  }

  return (
    <CldUploadWidget
      signatureEndpoint="/api/sign-cloudinary-params"
      options={{ folder: "thaingam/albums", sources: ["local", "url"], multiple: true }}
      onSuccess={handleSuccess}
      onQueuesEnd={flush}
    >
      {({ open, isLoading }) => <AutoOpenButton open={() => open()} isLoading={isLoading} />}
    </CldUploadWidget>
  );
}

function AutoOpenButton({ open, isLoading }: { open: () => void; isLoading?: boolean }) {
  const opened = useRef(false);
  useEffect(() => {
    // เปิดครั้งเดียวหลังสคริปต์พร้อม (เรียก open() ก่อน widget โหลดเสร็จ = no-op)
    if (opened.current || isLoading) return;
    opened.current = true;
    open();
  }, [isLoading, open]);
  return (
    <Button type="button" variant="outline" size="sm" onClick={() => open()} disabled={isLoading}>
      {isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <ImageUp aria-hidden="true" />}
      เพิ่มรูป
    </Button>
  );
}
