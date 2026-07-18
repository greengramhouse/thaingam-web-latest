"use client";

import { useEffect, useRef, useState } from "react";
import { CldUploadWidget, type CloudinaryUploadWidgetResults } from "next-cloudinary";
import { ImageUp, Loader2, X } from "lucide-react";
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
        <UploadButton onSuccess={handleSuccess} />
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

/**
 * ปุ่มอัปโหลด — mount `CldUploadWidget` เฉพาะหลังผู้ใช้กด (lazy)
 *
 * 🐛 ทำไมต้อง lazy (เจอตอน 4.4.4): `CldUploadWidget` โหลดสคริปต์ `all.js` ทันทีที่ mount
 *    และ `onLoad` ของ next-cloudinary เรียก `createUploadWidget()` เลย → **ฉีด iframe ของ
 *    widget เข้า DOM ทันทีที่สคริปต์โหลดเสร็จ** การแทรก iframe นั้นแย่ง focus จาก input
 *    ที่กำลังพิมพ์อยู่ → เคอร์เซอร์หลุดกลางคัน (พิมพ์ชื่อ แล้วรอแป๊บ เคอร์เซอร์หายเอง)
 *    → ไม่ mount widget จนกว่าจะกด "อัปโหลด" ตอนกรอกฟอร์มจึงไม่มี iframe มากวน focus
 */
function UploadButton({ onSuccess }: { onSuccess: (result: CloudinaryUploadWidgetResults) => void }) {
  const [active, setActive] = useState(false);

  if (!active) {
    return (
      <Button type="button" variant="outline" onClick={() => setActive(true)}>
        <ImageUp aria-hidden="true" />
        อัปโหลด
      </Button>
    );
  }

  return (
    <CldUploadWidget
      signatureEndpoint="/api/sign-cloudinary-params"
      options={{ folder: "thaingam/news", sources: ["local", "url"], multiple: false, maxFiles: 1 }}
      onSuccess={onSuccess}
    >
      {({ open, isLoading }) => <AutoOpenButton open={() => open()} isLoading={isLoading} />}
    </CldUploadWidget>
  );
}

/**
 * กดครั้งแรก → mount widget แล้วเปิด dialog ให้เองพอสคริปต์พร้อม (`isLoading` เป็น false)
 * ปุ่มยังกดเปิดซ้ำได้เอง (เผื่อ auto-open ไม่ทำงาน) · ครั้งถัด ๆ ไป widget mount อยู่แล้ว เปิดทันที
 */
function AutoOpenButton({ open, isLoading }: { open: () => void; isLoading?: boolean }) {
  const opened = useRef(false);

  useEffect(() => {
    // เปิดครั้งเดียว และต้องรอสคริปต์โหลดก่อน — เรียก open() ก่อน widget พร้อมจะกลายเป็น no-op
    if (opened.current || isLoading) return;
    opened.current = true;
    open();
  }, [isLoading, open]);

  return (
    <Button type="button" variant="outline" onClick={() => open()} disabled={isLoading}>
      {isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : <ImageUp aria-hidden="true" />}
      อัปโหลด
    </Button>
  );
}
