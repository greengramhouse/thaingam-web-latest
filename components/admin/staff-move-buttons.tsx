"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { moveStaff, moveStaffDepartment, type MoveDirection } from "@/server/actions/staff";

type Props = {
  /** อยู่หัว/ท้ายรายการแล้ว — ปิดปุ่มไว้แทนที่จะให้กดแล้วเงียบ */
  isFirst: boolean;
  isLast: boolean;
  labels: { up: string; down: string };
  move: (direction: MoveDirection) => Promise<{ ok: boolean; error?: string }>;
};

function MoveButtons({ isFirst, isLast, labels, move }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleMove(direction: MoveDirection) {
    startTransition(async () => {
      const result = await move(direction);
      if (!result.ok) {
        toast.error(result.error ?? "เลื่อนลำดับไม่สำเร็จ");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex items-center">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => handleMove("up")}
        disabled={isPending || isFirst}
        aria-label={labels.up}
        title={labels.up}
      >
        <ChevronUp />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => handleMove("down")}
        disabled={isPending || isLast}
        aria-label={labels.down}
        title={labels.down}
      >
        <ChevronDown />
      </Button>
    </div>
  );
}

/** เลื่อนบุคลากรขึ้น/ลงภายในกลุ่มของตัวเอง */
export function StaffMoveButtons({ id, name, ...rest }: { id: string; name: string; isFirst: boolean; isLast: boolean }) {
  return (
    <MoveButtons
      {...rest}
      labels={{ up: `เลื่อน ${name} ขึ้น`, down: `เลื่อน ${name} ลง` }}
      move={(direction) => moveStaff(id, direction)}
    />
  );
}

/** เลื่อนทั้งกลุ่ม/ฝ่ายขึ้น/ลง */
export function DepartmentMoveButtons({
  name,
  ...rest
}: {
  name: string;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <MoveButtons
      {...rest}
      labels={{ up: `เลื่อนกลุ่ม ${name} ขึ้น`, down: `เลื่อนกลุ่ม ${name} ลง` }}
      move={(direction) => moveStaffDepartment(name, direction)}
    />
  );
}
