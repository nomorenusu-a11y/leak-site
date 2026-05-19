import { getBoardStats } from "@/lib/posts";
import { BUSINESS } from "@/lib/business";
import { AnimatedCount } from "@/components/ui/AnimatedCount";

/**
 * 누적 통계 3종. 숫자는 뷰포트 진입 시 카운트업 (AnimatedCount).
 */
export async function StatsBar() {
  const stats = await getBoardStats();
  type Item =
    | { label: string; numeric: number; suffix: string }
    | { label: string; static: string };
  const items: Item[] = [
    { label: "누적 요청", numeric: stats.totalRequests, suffix: "건" },
    { label: "이번 달 작업 완료", numeric: stats.doneThisMonth, suffix: "건" },
    { label: "평균 출동 시간", static: BUSINESS.responseTime },
  ];

  return (
    <dl className="grid grid-cols-3 gap-3 sm:gap-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm"
        >
          <dt className="text-xs font-semibold text-slate-500 sm:text-sm">{it.label}</dt>
          <dd className="mt-1 text-xl font-extrabold text-brand-700 sm:text-2xl">
            {"numeric" in it ? (
              <AnimatedCount value={it.numeric} suffix={it.suffix} />
            ) : (
              it.static
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}
