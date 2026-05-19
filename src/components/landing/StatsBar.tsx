import { getBoardStats } from "@/lib/posts";
import { BUSINESS } from "@/lib/business";

/**
 * 누적 통계 3종. 페이지 dynamic 렌더 시 매번 카운트 쿼리.
 * "평균 출동 시간"은 BUSINESS.responseTime을 사용 — 운영 정책 변경 시 env로 즉시 교체.
 */
export async function StatsBar() {
  const stats = await getBoardStats();
  const items: { label: string; value: string }[] = [
    { label: "누적 요청", value: `${stats.totalRequests.toLocaleString("ko-KR")}건` },
    { label: "이번 달 작업 완료", value: `${stats.doneThisMonth.toLocaleString("ko-KR")}건` },
    { label: "평균 출동 시간", value: BUSINESS.responseTime },
  ];

  return (
    <dl className="grid grid-cols-3 gap-3 sm:gap-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm"
        >
          <dt className="text-xs font-semibold text-slate-500 sm:text-sm">{it.label}</dt>
          <dd className="mt-1 text-xl font-extrabold text-brand-700 sm:text-2xl">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}
