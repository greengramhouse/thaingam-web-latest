import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatThaiDateTime } from "@/lib/date";
import { ArrowLeft, Mail, Phone, Reply } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/admin/page-header";
import { AutoMarkRead } from "@/components/admin/auto-mark-read";
import { MessageDetailActions } from "@/components/admin/message-detail-actions";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

export const metadata: Metadata = { title: "อ่านข้อความติดต่อ" };

export default async function MessageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await requireRole("SUPER_ADMIN", "ADMIN");
  const { id } = await params;

  const message = await prisma.contactMessage.findUnique({ where: { id } });
  if (!message) notFound();

  const mailtoSubject = encodeURIComponent(message.subject ? `ตอบกลับ: ${message.subject}` : "ตอบกลับข้อความจากเว็บไซต์");
  const mailto = `mailto:${message.email}?subject=${mailtoSubject}`;

  return (
    <>
      {/* ทำเครื่องหมายอ่านแล้วเมื่อเปิดหน้านี้จริง (ฝั่ง client กัน prefetch mark ก่อนเวลา) */}
      <AutoMarkRead id={message.id} isRead={message.isRead} />

      <PageHeader
        title={message.subject || "(ไม่มีหัวข้อ)"}
        description={`จาก ${message.name}`}
        action={
          <Button variant="outline" nativeButton={false} render={<Link href="/admin/messages" />}>
            <ArrowLeft aria-hidden="true" />
            กลับกล่องข้อความ
          </Button>
        }
      />

      <Card>
        <CardHeader className="flex flex-col gap-3 border-b border-border sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-1 text-sm">
            <span className="text-base font-semibold">{message.name}</span>
            <a href={mailto} className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
              <Mail className="size-3.5 shrink-0" aria-hidden="true" />
              {message.email}
            </a>
            {message.phone && (
              <a href={`tel:${message.phone}`} className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                <Phone className="size-3.5 shrink-0" aria-hidden="true" />
                {message.phone}
              </a>
            )}
            <span className="text-xs text-muted-foreground">
              ส่งเมื่อ {formatThaiDateTime(message.createdAt, "medium")} น.
            </span>
          </div>
          <MessageDetailActions id={message.id} isRead={message.isRead} />
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pt-6">
          {/* ข้อความจากผู้ใช้ — ข้อความล้วน (whitespace-pre-wrap คงบรรทัด) ไม่ใช่ HTML */}
          <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.message}</p>

          <div>
            <Button variant="secondary" size="sm" nativeButton={false} render={<a href={mailto} />}>
              <Reply aria-hidden="true" />
              ตอบกลับทางอีเมล
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
