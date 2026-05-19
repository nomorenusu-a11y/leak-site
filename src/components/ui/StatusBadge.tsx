import { STATUS_LABEL, type RequestStatus } from "@/types/database";

const VARIANT: Record<RequestStatus, { bg: string; dot: string }> = {
  pending: { bg: "bg-slate-100 text-slate-700", dot: "bg-slate-400" },
  quote: { bg: "bg-brand-100 text-brand-700", dot: "bg-brand-500" },
  active: { bg: "bg-accent-100 text-accent-700", dot: "bg-accent-500" },
  done: { bg: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
};

export function StatusBadge({ status }: { status: RequestStatus }) {
  const v = VARIANT[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${v.bg}`}
    >
      <span aria-hidden className={`size-1.5 rounded-full ${v.dot}`} />
      {STATUS_LABEL[status]}
    </span>
  );
}
