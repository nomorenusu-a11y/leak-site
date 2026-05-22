import { Container } from "@/components/ui/Container";
import { Clock, ShieldCheck, Phone } from "@/components/icons";
import { BUSINESS } from "@/lib/business";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

/**
 * "30분 이내 출동!" 같은 시간 강조 섹션 (장인케어 IMG_8 톤).
 *
 * 측정 불가능한 가짜 숫자(3분 10초 등) 대신, 사실 기반 표현만 사용:
 *   - {BUSINESS.responseTime} 출동 (예: 30분 이내)
 *   - 24시간 365일 상담
 *   - 1년 무상 A/S 보장
 */
export function TimeEmphasis() {
  // 환경변수 값이 "30분 이내" 같은 시간이면 끝에 "출동!"을 붙이고,
  // 이미 "24시간 출동 가능" 등 동사를 포함하면 그대로 사용. 어색한 중복 방지.
  const rt = BUSINESS.responseTime;
  const headline = /출동|상담|가능/.test(rt) ? rt : `${rt} 출동!`;
  return (
    <section className="bg-slate-50 py-16 md:py-24">
      <Container>
        <Reveal variant="up" className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold tracking-wide text-brand-600 sm:text-base">
            누수, 아직도 고민만 하고 계신가요?
          </p>
          <h2 className="mt-3 text-4xl font-black leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            <span className="text-brand-600">{headline}</span>
          </h2>
          <p className="mt-5 text-base text-slate-700 sm:text-lg">
            전화 한 통이면 충분합니다. 사진과 함께 증상을 보내주시면,
            <br className="hidden sm:inline" />
            현장 도착 전부터 진단 방향을 잡아 빠르게 해결해드립니다.
          </p>
        </Reveal>

        <RevealGroup
          stagger={0.12}
          className="mx-auto mt-10 grid max-w-2xl gap-3 sm:grid-cols-3"
        >
          <RevealItem variant="up">
            <Card Icon={Phone} big="간편" caption="전화 또는 사진 문의 1회" />
          </RevealItem>
          <RevealItem variant="up">
            <Card Icon={Clock} big="24/365" caption="휴일·새벽 상담 가능" />
          </RevealItem>
          <RevealItem variant="up">
            <Card Icon={ShieldCheck} big="1년" caption="동일 부위 무상 A/S" />
          </RevealItem>
        </RevealGroup>

        <Reveal variant="up" delay={0.1}>
          <p className="mt-8 text-center text-base font-semibold text-slate-900 sm:text-lg">
            맡겨주시면 책임지고 해결해드립니다.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}

function Card({
  Icon,
  big,
  caption,
}: {
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>;
  big: string;
  caption: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-5 shadow-sm">
      <Icon aria-hidden className="mx-auto size-7 text-brand-600" strokeWidth={2} />
      <div className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
        {big}
      </div>
      <div className="mt-1 text-xs text-slate-600 sm:text-sm">{caption}</div>
    </div>
  );
}
