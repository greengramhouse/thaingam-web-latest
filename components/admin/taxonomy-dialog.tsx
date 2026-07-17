"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/admin/submit-button";
import { categoryFormSchema, tagFormSchema } from "@/lib/validations/taxonomy";
import { createCategory, createTag, updateCategory, updateTag } from "@/server/actions/taxonomy";

export type TaxonomyKind = "category" | "tag";

export type TaxonomyItem = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

type FormValues = { name: string; slug: string; description?: string };

const COPY = {
  category: {
    schema: categoryFormSchema,
    label: "หมวดหมู่",
    nameLabel: "ชื่อหมวดหมู่",
    namePlaceholder: "กิจกรรมโรงเรียน",
    slugPlaceholder: "activities",
    create: createCategory,
    update: updateCategory,
  },
  tag: {
    schema: tagFormSchema,
    label: "แท็ก",
    nameLabel: "ชื่อแท็ก",
    namePlaceholder: "วันไหว้ครู",
    slugPlaceholder: "wai-kru",
    create: createTag,
    update: updateTag,
  },
} as const;

/**
 * ฟอร์มสร้าง/แก้ไข หมวดหมู่และแท็ก — โครงเหมือนกันทั้งคู่ ต่างแค่ช่องคำอธิบาย (เฉพาะหมวดหมู่)
 * ใช้ dialog แทนหน้าแยกเพราะมีแค่ 2–3 ช่อง ไม่คุ้มที่จะเปลี่ยนหน้า (ต่างจากฟอร์มข่าวที่มี Tiptap)
 */
export function TaxonomyDialog({
  kind,
  item,
  open,
  onOpenChange,
}: {
  kind: TaxonomyKind;
  /** มี = แก้ไข · ไม่มี = สร้างใหม่ */
  item?: TaxonomyItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const copy = COPY[kind];

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: standardSchemaResolver(copy.schema),
    defaultValues: { name: "", slug: "", description: "" },
  });

  // dialog ไม่ unmount ตอนปิด → ต้อง reset ค่าเองทุกครั้งที่เปิด
  // ไม่งั้นกด "แก้ไข" รายการอื่นต่อจะเห็นค่าของรายการก่อนหน้าค้างอยู่
  useEffect(() => {
    if (open) {
      reset({ name: item?.name ?? "", slug: item?.slug ?? "", description: item?.description ?? "" });
    }
  }, [open, item, reset]);

  async function onSubmit(values: FormValues) {
    const result = item ? await copy.update(item.id, values) : await copy.create(values);

    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) setError(field as keyof FormValues, { message: messages[0] });
        }
      }
      toast.error(result.error);
      return;
    }

    toast.success(item ? `แก้ไข${copy.label}แล้ว` : `เพิ่ม${copy.label}แล้ว`);
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <DialogHeader>
            <DialogTitle>
              {item ? `แก้ไข${copy.label}` : `เพิ่ม${copy.label}`}
            </DialogTitle>
            <DialogDescription>
              slug คือส่วนท้าย URL ต้องเป็นอังกฤษพิมพ์เล็ก ตัวเลข และ - เท่านั้น
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor={`${kind}-name`}>{copy.nameLabel}</Label>
              <Input
                id={`${kind}-name`}
                placeholder={copy.namePlaceholder}
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor={`${kind}-slug`}>slug</Label>
              <Input
                id={`${kind}-slug`}
                placeholder={copy.slugPlaceholder}
                aria-invalid={!!errors.slug}
                {...register("slug")}
              />
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
            </div>

            {kind === "category" && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="category-description">คำอธิบาย (ไม่บังคับ)</Label>
                <Textarea
                  id="category-description"
                  rows={2}
                  aria-invalid={!!errors.description}
                  {...register("description")}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              ยกเลิก
            </Button>
            <SubmitButton pending={isSubmitting}>{item ? "บันทึก" : "เพิ่ม"}</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
