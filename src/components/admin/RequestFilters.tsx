import Link from "next/link";
import { STATUS_LABEL, STATUS_ORDER, type RequestStatus } from "@/types/database";

type Props = {
  /** 활성 status 필터. null이면 전체. */
  active: RequestStatus | null;
  order: "latest" | "oldest";
};

export function RequestFilters({ active, order }: Props) {
  const buildHref = (next: { status?: RequestStatus | null; order?: "latest" | "oldest" }) => {
    const params = new URLSearchParams();
    const s = next.status === undefined ? active : next.status;
    const o = next.order === undefined ? order : next.order;
    if (s) params.set("status", s);
    if (o && o !== "latest") params.set("order", o);
    const qs = params.toString();
    return qs ? `/admin/requests?${qs}` : "/admin/requests";
  };

  const chipClass = (selected: boolean) =>
    `inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
      selected
        ? "border-brand-600 bg-brand-600 text-white"
        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Link href={buildHref({ status: null })} className={chipClass(active === null)}>
        전체
      </Link>
      {STATUS_ORDER.map((s) => (
        <Link key={s} href={buildHref({ status: s })} className={chipClass(active === s)}>
          {STATUS_LABEL[s]}
        </Link>
      ))}
      <span className="mx-1 hidden text-slate-300 sm:inline">|</span>
      <Link
        href={buildHref({ order: "latest" })}
        className={chipClass(order === "latest")}
      >
        최신순
      </Link>
      <Link
        href={buildHref({ order: "oldest" })}
        className={chipClass(order === "oldest")}
      >
        오래된순
      </Link>
    </div>
  );
}
