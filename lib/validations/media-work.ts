import { z } from "zod";
import { slugSchema } from "@/lib/validations/slug";
import { isYoutubeUrl } from "@/lib/youtube";

export const MEDIA_TYPES = ["YOUTUBE", "VIDEO", "ARTICLE"] as const;

/** ชื่อไทยของแต่ละชนิด — ใช้ทั้งในฟอร์ม ตาราง และ badge */
export const MEDIA_TYPE_LABEL: Record<(typeof MEDIA_TYPES)[number], string> = {
  YOUTUBE: "วิดีโอ YouTube",
  VIDEO: "ไฟล์วิดีโอ",
  ARTICLE: "บทความ",
};

const isHttpUrl = (value: string) => z.string().url().safeParse(value).success;

/**
 * ฟอร์มเป็น object แบน ๆ (ไม่ใช่ discriminated union) ตั้งใจ —
 * react-hook-form ต้องการชุด field ที่คงที่ ไม่งั้นค่าที่กรอกไว้จะหายตอนสลับชนิด
 * แล้วใช้ superRefine บังคับเฉพาะ field ที่ชนิดนั้นต้องมี
 *
 * ⚠️ field ของชนิดอื่นที่ไม่ได้ใช้ **ไม่ validate** แต่จะถูกล้างเป็น null ตอนบันทึก
 *    (ดู pickTypeFields ใน server/actions/media-work.ts) — กันข้อมูลค้างตอนสลับชนิดไปมา
 */
export const mediaWorkFormSchema = z
  .object({
    title: z.string().min(1, "กรุณากรอกชื่อผลงาน").max(200, "ชื่อยาวเกินไป (ไม่เกิน 200 ตัวอักษร)"),
    slug: slugSchema,
    description: z.string().max(300, "คำอธิบายยาวเกินไป (ไม่เกิน 300 ตัวอักษร)").optional().or(z.literal("")),
    type: z.enum(MEDIA_TYPES),
    youtubeUrl: z.string().optional().or(z.literal("")),
    videoUrl: z.string().optional().or(z.literal("")),
    content: z.string().optional().or(z.literal("")),
    thumbnail: z.string().url("ลิงก์รูปไม่ถูกต้อง").optional().or(z.literal("")),
    tagIds: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  })
  .superRefine((data, ctx) => {
    if (data.type === "YOUTUBE") {
      if (!data.youtubeUrl?.trim()) {
        ctx.addIssue({ code: "custom", path: ["youtubeUrl"], message: "กรุณาใส่ลิงก์ YouTube" });
      } else if (!isYoutubeUrl(data.youtubeUrl)) {
        ctx.addIssue({
          code: "custom",
          path: ["youtubeUrl"],
          message: "ลิงก์ YouTube ไม่ถูกต้อง (เช่น https://www.youtube.com/watch?v=… หรือ https://youtu.be/…)",
        });
      }
    }

    if (data.type === "VIDEO") {
      if (!data.videoUrl?.trim()) {
        ctx.addIssue({ code: "custom", path: ["videoUrl"], message: "กรุณาใส่ลิงก์ไฟล์วิดีโอ" });
      } else if (!isHttpUrl(data.videoUrl)) {
        ctx.addIssue({ code: "custom", path: ["videoUrl"], message: "ลิงก์วิดีโอไม่ถูกต้อง" });
      }
    }

    if (data.type === "ARTICLE") {
      // Tiptap ส่ง "<p></p>" มาตอนว่าง — เช็คว่ามีตัวอักษรจริง ไม่ใช่แค่แท็กเปล่า
      const text = (data.content ?? "").replace(/<[^>]*>/g, "").trim();
      if (!text) {
        ctx.addIssue({ code: "custom", path: ["content"], message: "กรุณากรอกเนื้อหาบทความ" });
      }
    }
  });

export type MediaWorkFormValues = z.input<typeof mediaWorkFormSchema>;
