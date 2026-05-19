import type { LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Crosshair, Tag, ShieldCheck, UserCheck } from "@/components/icons";
import { BUSINESS } from "@/lib/business";
import { FadeUp } from "@/components/ui/FadeUp";

/**
 * 4대 강점 카드. 1인 영업 톤 — "사장님 직접 출동" 강조.
 * 단색 lucide SVG (1.5 stroke)로 통일. OS 이모지 사용 금지.
 */
export function TrustPoints() {
  const items: { Icon: LucideIcon; title: string; desc: string }[] = [
    {
      Icon: Crosshair,
      title: "정확한 누수 탐지",
      desc: "비파괴 정밀 장비로 위치를 특정해, 벽·바닥 파괴를 최소화합니다.",
    },
    {
      Icon: Tag,
      title: BUSINESS.pricing,
      desc: "방문 견적 후 합의된 금액만 청구합니다. 추가비 없음.",
    },
    {
      Icon: ShieldCheck,
      title: BUSINESS.warranty,
      desc: "시공 후 1년간 동일 부위 재누수 시 무상 처리합니다.",
    },
    {
      Icon: UserCheck,
      title: "사장님 직접 출동",
      desc: `외주·신입 파견 없이 ${BUSINESS.experience} 마스터가 직접 방문합니다.`,
    },
  ];

  return (
    <section className="py-16 md:py-24">
      <Container>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          왜 저희를 선택하시나요
        </h2>
        <p className="mt-2 text-slate-600">
          {BUSINESS.serviceArea}에서 동일한 마스터가 처음부터 끝까지 직접 진행합니다.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ Icon, title, desc }, i) => (
            <FadeUp key={title} delay={i * 0.08}>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="inline-flex size-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon aria-hidden className="size-6" strokeWidth={1.75} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{desc}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </Container>
    </section>
  );
}
