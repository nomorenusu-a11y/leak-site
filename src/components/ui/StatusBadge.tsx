import type { LucideIcon } from "lucide-react";
import { Inbox, Mail, Loader2, Check } from "@/components/icons";
import { STATUS_LABEL, type RequestStatus } from "@/types/database";

const VARIANT: Record<RequestStatus, { bg: string; Icon: LucideIcon; spin?: boolean }> = {
  pending: { bg: "bg-slate-100 text-slate-700", Icon: Inbox },
  quote: { bg: "bg-info-bg text-info", Icon: Mail },
  active: { bg: "bg-accent-50 text-accent-700", Icon: Loader2, spin: true },
  done: { bg: "bg-success-bg text-success", Icon: Check },
};

/**
 * 상태 뱃지. 색 + 아이콘 동시 사용으로 색맹 접근성 통과.
 */
export function StatusBadge({ status }: { status: RequestStatus }) {
  const { bg, Icon, spin } = VARIANT[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${bg}`}
    >
      <Icon
        aria-hidden
        className={`size-3.5 ${spin ? "animate-spin" : ""}`}
        strokeWidth={2.25}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}
