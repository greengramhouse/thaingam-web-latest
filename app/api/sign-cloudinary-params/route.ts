import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { canManageContent, getCurrentUser } from "@/lib/rbac";

/**
 * เซ็น params ให้ CldUploadWidget (อัปโหลดแบบ signed)
 *
 * ⚠️ ต้องกันสิทธิ์ที่นี่ให้แน่น — ใครยิง endpoint นี้ได้ = อัปไฟล์เข้าบัญชี Cloudinary ของโรงเรียนได้
 *    (เลือก signed แทน unsigned preset ด้วยเหตุผลเดียวกัน: unsigned preset เปิดให้ทุกคนอัปได้)
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !canManageContent(user.role)) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  }

  const { CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, CLOUDINARY_CLOUD_NAME } = process.env;
  if (!CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET || !CLOUDINARY_CLOUD_NAME) {
    console.error("sign-cloudinary-params: ยังไม่ได้ตั้งค่า Cloudinary ใน .env");
    return NextResponse.json({ error: "ยังไม่ได้ตั้งค่า Cloudinary" }, { status: 500 });
  }

  const body = (await request.json()) as { paramsToSign?: Record<string, string> };
  if (!body.paramsToSign) {
    return NextResponse.json({ error: "ข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const signature = cloudinary.utils.api_sign_request(body.paramsToSign, CLOUDINARY_API_SECRET);

  return NextResponse.json({ signature });
}
