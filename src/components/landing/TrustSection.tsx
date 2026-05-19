import { Container } from "@/components/ui/Container";

const ITEMS = [
  {
    icon: "🔬",
    title: "정밀 누수 탐지",
    desc: "열화상·청음·압력 테스트 등 비파괴 방식으로 누수 위치를 먼저 정확히 찾습니다.",
  },
  {
    icon: "🛠️",
    title: "최소 시공 원칙",
    desc: "타일·벽체 손상을 최소화하는 방법으로 시공합니다. 견적 전 반드시 확인 후 진행.",
  },
  {
    icon: "📸",
    title: "사진 견적 + 사후 보증",
    desc: "현장 진단 사진과 함께 견적을 드리고, 시공 후 1년 보증을 제공합니다.",
  },
];

export function TrustSection() {
  return (
    <section className="py-12 sm:py-16">
      <Container>
        <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
          왜 저희를 선택해야 할까요
        </h2>
        <p className="mt-2 text-slate-600">
          누수는 어디서 새는지 정확히 찾는 게 시작입니다. 추측 시공 대신 진단 기반 시공으로 비용을 줄입니다.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ITEMS.map((it) => (
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
