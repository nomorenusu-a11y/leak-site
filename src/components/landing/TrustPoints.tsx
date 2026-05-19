import { Container } from "@/components/ui/Container";
import { BUSINESS } from "@/lib/business";

/**
 * 4대 강점 카드. 1인 영업 톤 — "사장님 직접 출동" 강조.
 * cnsolution.kr 4대 강점 영역 톤 참고 (아이콘 + 헤드라인 + 짧은 카피).
 */
export function TrustPoints() {
  const items: { icon: string; title: string; desc: string }[] = [
    {
      icon: "🎯",
      title: "정확한 누수 탐지",
      desc: "비파괴 정밀 장비로 위치를 특정해, 벽·바닥 파괴를 최소화합니다.",
    },
    {
      icon: "💰",
      title: BUSINESS.pricing,
      desc: "방문 견적 후 합의된 금액만 청구합니다. 추가비 없음.",
    },
    {
      icon: "🛡️",
      title: BUSINESS.warranty,
      desc: "시공 후 1년간 동일 부위 재누수 시 무상 처리합니다.",
    },
    {
      icon: "👨‍🔧",
      title: "사장님 직접 출동",
      desc: `외주·신입 파견 없이 ${BUSINESS.experience} 마스터가 직접 방문합니다.`,
    },
  ];

  return (
    <section className="py-12 sm:py-16">
      <Container>
        <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          왜 저희를 선택하시나요
        </h2>
        <p className="mt-2 text-slate-600">
          {BUSINESS.serviceArea}에서 동일한 마스터가 처음부터 끝까지 직접 진행합니다.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div
              key={it.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="text-3xl" aria-hidden>
                {it.icon}
              </div>
              <h3 className="mt-3 text-lg font-bold text-slate-900">{it.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{it.desc}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
