"use client";

import { useEffect, useRef, useState } from "react";
import { CldUploadWidget, type CloudinaryUploadWidgetResults } from "next-cloudinary";
import { ExternalLink, FileText, FileUp, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** ชื่อไฟล์จาก URL (segment สุดท้าย, ตัด query) — ไว้โชว์ในชิป */
function fileNameFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    return decodeURIComponent(path.split("/").pop() || url);
  } catch {
    return url;
  }
}

/**
 * เลือกไฟล์เอกสารได้ 2 ทาง: อัปโหลดขึ้น Cloudinary (raw/auto) หรือวาง URL ตรง ๆ (เช่น Google Drive)
 * เก็บลง DB เป็น URL เสมอ — ไม่มีไฟล์บน server (spec §5) · ต่างจาก ImageUpload ตรงที่แสดงเป็นชิปไฟล์ ไม่ใช่รูป
 */
export function FileUpload({
  value,
  onChange,
  ariaInvalid,
}: {
  value: string;
  onChange: (url: string) => void;
  ariaInvalid?: boolean;
}) {
  function handleSuccess(result: CloudinaryUploadWidgetResults) {
    const info = result.info;
    if (info && typeof info !== "string") onChange(info.secure_url);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="วางลิงก์ไฟล์ หรือกดอัปโหลด"
          aria-invalid={ariaInvalid}
          aria-label="ลิงก์ไฟล์เอกสาร"
        />
        <UploadButton onSuccess={handleSuccess} />
      </div>

      {value ? (
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
          <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="min-w-0 flex-1 truncate text-sm" title={value}>
            {fileNameFromUrl(value)}
          </span>
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            aria-label="เปิดไฟล์ในแท็บใหม่"
            title="เปิดไฟล์"
          >
            <ExternalLink className="size-4" />
          </a>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="shrink-0"
            onClick={() => onChange("")}
            aria-label="เอาไฟล์ออก"
          >
            <X />
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/**
 * ปุ่มอัปโหลด — mount `CldUploadWidget` เฉพาะหลังผู้ใช้กด (lazy) เพื่อกัน iframe แย่ง focus
 * ตอนกำลังพิมพ์ (problems.md 5.4 — เหมือน ImageUpload)
 */
function UploadButton({ onSuccess }: { onSuccess: (result: CloudinaryUploadWidgetResults) => void }) {
  const [active, setActive] = useState(false);

  if (!active) {
    return (
      <Button type="button" variant="outline" onClick={() => setActive(true)}>
        <FileUp aria-hidden="true" />
        อัปโหลด
      </Button>
    );
  }

  return (
    <CldUploadWidget
      signatureEndpoint="/api/sign-cloudinary-params"
      options={{
        folder: "thaingam/documents",
        // เอกสารไม่ใช่รูป → resourceType auto ให้ Cloudinary เก็บเป็น raw/ตามชนิดไฟล์
        resourceType: "auto",
        sources: ["local", "url"],
        multiple: false,
        maxFiles: 1,
      }}
      onSuccess={onSuccess}
    >
      {({ open, isLoading }) => <AutoOpenButton open={() => open()} isLoading={isLoading} />}
    </CldUploadWidget>
  );
}

function AutoOpenButton({ open, isLoading }: { open: () => void; isLoading?: boolean }) {
  const opened = useRef(false);

  useEffect(() => {
    if (opened.current || isLoading) return;
    opened.current = true;
    open();
  }, [isLoading, open]);

  return (
    <Button type="button" variant="outline" onClick={() => open()} disabled={isLoading}>
      {isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <FileUp aria-hidden="true" />}
      อัปโหลด
    </Button>
  );
}
