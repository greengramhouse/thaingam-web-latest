"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.string().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(1, "กรุณากรอกรหัสผ่าน"),
});

type LoginValues = z.infer<typeof loginSchema>;

const fieldBase =
  "h-11 w-full rounded-[10px] border bg-[#F1F2F7] pl-[42px] text-base text-[#1C2135] outline-none transition-colors placeholder:text-[#9AA0B4] focus:border-[#333D6D] focus:bg-white focus:ring-[3px] focus:ring-[#333D6D]/15";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: standardSchemaResolver(loginSchema),
  });

  async function onSubmit(values: LoginValues) {
    setServerError(null);
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      rememberMe,
    });
    if (error) {
      setServerError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      return;
    }
    const redirectTo = searchParams.get("redirect") || "/admin";
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div>
      <h2 className="mb-2 text-[28px] font-bold tracking-[-.01em]">เข้าสู่ระบบ</h2>
      <p className="mb-7 text-[15px] leading-[1.6] text-[#6B7189]">
        กรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบหลังบ้าน
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* อีเมล */}
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium"
        >
          อีเมล
        </label>
        <div className="relative mb-[18px]">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#9AA0B4]" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@thaingam.ac.th"
            aria-invalid={!!errors.email}
            className={`${fieldBase} pr-3.5 ${
              errors.email
                ? "border-[#D64545] focus:border-[#D64545] focus:ring-[#D64545]/15"
                : "border-[#E5E7F0]"
            }`}
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1.5 text-[13px] text-[#D64545]">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* รหัสผ่าน */}
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium"
        >
          รหัสผ่าน
        </label>
        <div className="relative mb-5">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#9AA0B4]" />
          <input
            id="password"
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            className={`${fieldBase} pr-11 ${
              errors.password
                ? "border-[#D64545] focus:border-[#D64545] focus:ring-[#D64545]/15"
                : "border-[#E5E7F0]"
            }`}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#6B7189] transition-colors hover:bg-[#EEF0F6]"
          >
            {showPw ? (
              <EyeOff className="h-[18px] w-[18px]" />
            ) : (
              <Eye className="h-[18px] w-[18px]" />
            )}
          </button>
          {errors.password && (
            <p className="mt-1.5 text-[13px] text-[#D64545]">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* จดจำการเข้าสู่ระบบ */}
        <label className="mb-6 flex cursor-pointer select-none items-center gap-2.5 text-sm text-[#4A5069]">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-[18px] w-[18px] rounded-[5px] border-[1.5px] border-[#CFD3E2] accent-[#333D6D]"
          />
          จดจำการเข้าสู่ระบบไว้
        </label>

        {serverError && (
          <div
            role="alert"
            className="mb-4 rounded-[10px] border border-[#F1D0D0] bg-[#FBEAEA] px-3.5 py-2.5 text-sm text-[#D64545]"
          >
            {serverError}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full rounded-[10px] bg-[#333D6D] text-[15px] font-semibold text-white shadow-[0_1px_2px_rgba(51,61,109,.25)] transition-colors hover:bg-[#2A3159] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}
        </button>
      </form>
    </div>
  );
}
