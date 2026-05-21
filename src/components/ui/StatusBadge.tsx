import type { LucideIcon } from "lucide-react";
import { Inbox, Mail, Loader2, Check } from "@/components/icons";
import { STATUS_LABEL, type RequestStatus } from "@/types/database";

type Variant = "soft" | "solid";

type Style = {
  bg: string;
  Icon: LucideIcon;
  spin?: boolean;
  liveDot?: boolean;
};

const SOFT: Record<RequestStatus, Style> = {
  pending: { bg: "bg-slate-100 text-slate-700", Icon: Inbox },
  quote: { bg: "bg-info-bg text-info", Icon: Mail },
  active: { bg: "bg-accent-50 text-accent-700", Icon: Loader2, spin: true },
  done: { bg: "bg-success-bg text-success", Icon: Check },
};

/**
 * cnsolution 톤: 진한 배경 + 흰 글자 + active에 live-dot 깜빡임.
 * 무한 스크롤 LiveBoard에서 사용.
 */
const SOLID: Record<RequestStatus, Style> = {
  pending: { bg: "bg-brand-600 text-white", Icon: Inbox },
  quote: { bg: "bg-accent-500 text-white", Icon: Mail },
  active: { bg: "bg-emerald-600 text-white", Icon: Loader2, spin: true, liveDot: true },
  done: { bg: "bg-brand-800 text-white", Icon: Check },
};

/**
 * 상태 뱃지. 색 + 아이콘 동시 사용으로 색맹 접근성 통과.
 *
 * @param variant "soft"(기본, 파스텔) / "solid"(진한 배경, 무한 스크롤용)
 */
export function StatusBadge({
  status,
  variant = "soft",
}: {
  status: RequestStatus;
  variant?: Variant;
}) {
  const style = variant === "solid" ? SOLID[status] : SOFT[status];
  const { bg, Icon, spin, liveDot } = style;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${bg}`}
    >
      {liveDot && <span aria-hidden className="live-dot" />}
      <Icon
        aria-hidden
        className={`size-3.5 ${spin ? "animate-spin" : ""}`}
        strokeWidth={2.25}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}
