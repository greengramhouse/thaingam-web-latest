"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/admin/submit-button";
import { SETTING_GROUPS, fieldName, type SettingInput } from "@/lib/site-settings";
import { siteSettingsFormSchema, type SiteSettingsFormValues } from "@/lib/validations/site-settings";
import { updateSiteSettings } from "@/server/actions/site-settings";

const INPUT_TYPE: Record<Exclude<SettingInput, "textarea">, string> = {
  text: "text",
  url: "url",
  email: "email",
  tel: "tel",
};

export function SiteSettingsForm({ values }: { values: Record<string, string> }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  // defaultValues คีย์ด้วยชื่อ field (dot → __) ให้ตรงกับที่ zod/register ใช้
  const defaultValues: Record<string, string> = {};
  for (const group of SETTING_GROUPS) {
    for (const def of group.settings) {
      defaultValues[fieldName(def.key)] = values[def.key] ?? "";
    }
  }

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SiteSettingsFormValues>({
    resolver: standardSchemaResolver(siteSettingsFormSchema),
    defaultValues,
  });

  async function onSubmit(formValues: SiteSettingsFormValues) {
    setServerError(null);
    const result = await updateSiteSettings(formValues);

    if (!result.ok) {
      if (result.fieldErrors) {
        for (const [field, messages] of Object.entries(result.fieldErrors)) {
          if (messages?.[0]) setError(field as keyof SiteSettingsFormValues, { message: messages[0] });
        }
      }
      setServerError(result.error);
      toast.error(result.error);
      return;
    }

    toast.success("บันทึกการตั้งค่าแล้ว");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6" noValidate>
      {SETTING_GROUPS.map((group) => (
        <Card key={group.title}>
          <CardHeader>
            <CardTitle className="text-base">{group.title}</CardTitle>
            {group.description && <p className="text-sm text-muted-foreground">{group.description}</p>}
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            {group.settings.map((def) => {
              const name = fieldName(def.key) as keyof SiteSettingsFormValues;
              const error = errors[name];
              const full = def.input === "textarea";
              return (
                <div key={def.key} className={`flex flex-col gap-2 ${full ? "sm:col-span-2" : ""}`}>
                  <Label htmlFor={name}>{def.label}</Label>
                  {def.input === "textarea" ? (
                    <Textarea id={name} rows={3} placeholder={def.placeholder} aria-invalid={!!error} {...register(name)} />
                  ) : (
                    <Input
                      id={name}
                      type={INPUT_TYPE[def.input]}
                      placeholder={def.placeholder}
                      aria-invalid={!!error}
                      {...register(name)}
                    />
                  )}
                  {def.help && <p className="text-xs text-muted-foreground">{def.help}</p>}
                  {error && <p className="text-sm text-destructive">{error.message as string}</p>}
                </div>
              );
            })}
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center gap-3">
        <SubmitButton pending={isSubmitting}>บันทึกการตั้งค่า</SubmitButton>
        {serverError && (
          <p className="text-sm text-destructive" role="alert">
            {serverError}
          </p>
        )}
      </div>
    </form>
  );
}
