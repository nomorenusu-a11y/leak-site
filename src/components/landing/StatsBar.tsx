import { BUSINESS } from "@/lib/business";

/**
 * 운영 정보 3카드.
 *
 * 이전에는 누적 요청 / 이번 달 작업 완료 등 숫자 카운터를 표시했지만,
 * 운영 초기에는 진짜 데이터가 적어 의미 없고, 더미와 섞으면 표시광고법
 * 회색지대 위험이 있어 사실 정보 카드로 교체.
 *
 * 운영 안정화 후 진짜 통계를 살리고 싶다면 git history에서 이전 버전 참고:
 *   - lib/posts.ts:getBoardStats()  ← 함수 자체는 보존됨
 *   - components/ui/AnimatedCount   ← 컴포넌트도 보존됨
 */
export function StatsBar() {
  const items: { label: string; value: string }[] = [
    { label: "출동 지역", value: BUSINESS.serviceArea },
    { label: "상담 시간", value: BUSINESS.responseTime },
    { label: "A/S 보장", value: BUSINESS.warranty },
  ];

  return (
    <dl className="grid grid-cols-3 gap-3 sm:gap-4">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm"
        >
          <dt className="text-xs font-semibold text-slate-500 sm:text-sm">{it.label}</dt>
          <dd className="mt-1 text-base font-extrabold text-brand-700 sm:text-lg">
            {it.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
