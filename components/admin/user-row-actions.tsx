"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Ban, KeyRound, MoreHorizontal, ShieldCheck, Trash2, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { roleLabel } from "@/components/admin/role-label";
import { USER_ROLES } from "@/lib/validations/user";

type Role = (typeof USER_ROLES)[number];

export function UserRowActions({
  user,
  isSelf,
}: {
  user: { id: string; name: string; role: string; banned: boolean };
  /** true = แถวของตัวเอง → ปิดการเปลี่ยนบทบาท/แบน/ลบ กันล็อกตัวเองออก */
  isSelf: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [roleOpen, setRoleOpen] = useState(false);
  const [role, setRole] = useState<Role>(user.role as Role);
  const [pwOpen, setPwOpen] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  function done(message: string) {
    toast.success(message);
    router.refresh();
  }

  function handleChangeRole() {
    if (role === user.role) {
      setRoleOpen(false);
      return;
    }
    startTransition(async () => {
      const { error } = await authClient.admin.setRole({ userId: user.id, role });
      if (error) {
        toast.error(error.message || "เปลี่ยนบทบาทไม่สำเร็จ");
        return;
      }
      setRoleOpen(false);
      done("เปลี่ยนบทบาทแล้ว");
    });
  }

  function handleResetPassword() {
    if (pw.length < 8) {
      setPwError("รหัสผ่านอย่างน้อย 8 ตัวอักษร");
      return;
    }
    startTransition(async () => {
      const { error } = await authClient.admin.setUserPassword({ userId: user.id, newPassword: pw });
      if (error) {
        setPwError(error.message || "รีเซ็ตรหัสผ่านไม่สำเร็จ");
        return;
      }
      setPwOpen(false);
      setPw("");
      setPwError(null);
      done("รีเซ็ตรหัสผ่านแล้ว");
    });
  }

  function handleToggleBan() {
    startTransition(async () => {
      const { error } = user.banned
        ? await authClient.admin.unbanUser({ userId: user.id })
        : await authClient.admin.banUser({ userId: user.id });
      if (error) {
        toast.error(error.message || "ทำรายการไม่สำเร็จ");
        return;
      }
      done(user.banned ? "ปลดแบนแล้ว" : "แบนผู้ใช้แล้ว");
    });
  }

  async function handleDelete() {
    const { error } = await authClient.admin.removeUser({ userId: user.id });
    if (error) {
      toast.error(error.message || "ลบผู้ใช้ไม่สำเร็จ");
      return;
    }
    done("ลบผู้ใช้แล้ว");
  }

  return (
    <div className="flex justify-end">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" size="icon-sm" aria-label="จัดการผู้ใช้" />}
        >
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem disabled={isSelf || isPending} onClick={() => setRoleOpen(true)}>
            <ShieldCheck className="size-4" aria-hidden="true" />
            เปลี่ยนบทบาท
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isPending} onClick={() => setPwOpen(true)}>
            <KeyRound className="size-4" aria-hidden="true" />
            รีเซ็ตรหัสผ่าน
          </DropdownMenuItem>
          <DropdownMenuItem disabled={isSelf || isPending} onClick={handleToggleBan}>
            {user.banned ? (
              <>
                <UserCheck className="size-4" aria-hidden="true" />
                ปลดแบน
              </>
            ) : (
              <>
                <Ban className="size-4" aria-hidden="true" />
                แบนผู้ใช้
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            disabled={isSelf || isPending}
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" aria-hidden="true" />
            ลบผู้ใช้
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* เปลี่ยนบทบาท */}
      <Dialog open={roleOpen} onOpenChange={setRoleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>เปลี่ยนบทบาท</DialogTitle>
            <DialogDescription>{user.name}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`role-${user.id}`}>บทบาทใหม่</Label>
            <select
              id={`role-${user.id}`}
              className="h-9 rounded-lg border border-border bg-background px-2 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              {USER_ROLES.map((r) => (
                <option key={r} value={r}>
                  {roleLabel(r)}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleChangeRole} disabled={isPending}>
              บันทึก
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* รีเซ็ตรหัสผ่าน */}
      <Dialog
        open={pwOpen}
        onOpenChange={(open) => {
          setPwOpen(open);
          if (!open) {
            setPw("");
            setPwError(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>รีเซ็ตรหัสผ่าน</DialogTitle>
            <DialogDescription>ตั้งรหัสผ่านใหม่ให้ {user.name} แล้วแจ้งเจ้าตัว</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor={`pw-${user.id}`}>รหัสผ่านใหม่</Label>
            <Input
              id={`pw-${user.id}`}
              type="text"
              autoComplete="new-password"
              value={pw}
              onChange={(e) => {
                setPw(e.target.value);
                setPwError(null);
              }}
              aria-invalid={!!pwError}
            />
            {pwError && <p className="text-sm text-destructive">{pwError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwOpen(false)}>
              ยกเลิก
            </Button>
            <Button onClick={handleResetPassword} disabled={isPending}>
              บันทึกรหัสผ่าน
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="ลบผู้ใช้นี้?"
        description={`${user.name} จะถูกลบถาวร รวมถึงสิทธิ์เข้าระบบทั้งหมด กู้คืนไม่ได้`}
        confirmLabel="ลบผู้ใช้"
        onConfirm={handleDelete}
      />
    </div>
  );
}
