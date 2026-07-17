"use client";

import { CldUploadWidget, type CloudinaryUploadWidgetResults } from "next-cloudinary";
import { ImageUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * เลือกรูปได้ 2 ทาง: อัปโหลดขึ้น Cloudinary หรือวาง URL ตรง ๆ (เช่นลิงก์จาก Google Drive)
 * เก็บลง DB เป็น URL เสมอ — ไม่มีไฟล์บน server (spec §5)
 */
export function ImageUpload({
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
          placeholder="วางลิงก์รูป หรือกดอัปโหลด"
          aria-invalid={ariaInvalid}
          aria-label="ลิงก์รูปปก"
        />
        <CldUploadWidget
          signatureEndpoint="/api/sign-cloudinary-params"
          options={{ folder: "thaingam/news", sources: ["local", "url"], multiple: false, maxFiles: 1 }}
          onSuccess={handleSuccess}
        >
          {({ open }) => (
            <Button type="button" variant="outline" onClick={() => open()}>
              <ImageUp aria-hidden="true" />
              อัปโหลด
            </Button>
          )}
        </CldUploadWidget>
      </div>

      {value ? (
        <div className="relative w-fit">
          {/* ใช้ <img> ไม่ใช่ next/image เพราะ URL มาจากโดเมนไหนก็ได้ที่ผู้ใช้วางเอง */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="ตัวอย่างรูปปก"
            className="h-32 w-auto rounded-md border border-border object-cover"
          />
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            className="absolute -top-2 -right-2"
            onClick={() => onChange("")}
            aria-label="เอารูปออก"
          >
            <X />
          </Button>
        </div>
      ) : null}
    </div>
  );
}
