import { Container } from "@/components/ui/Container";
import { Clock, ShieldCheck, Phone } from "@/components/icons";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

export function TimeEmphasis() {
  return (
    <section className="bg-slate-50 py-8 md:py-12">
      <Container>
        <Reveal variant="up" className="mx-auto text-center">
          <p className="text-sm font-bold tracking-wide text-brand-600 sm:text-base">
            누수, 아직도 고민만 하고 계신가요?
          </p>
          <h2 className="mt-3 text-5xl font-black leading-tight tracking-tight text-brand-600 sm:text-6xl lg:text-7xl">
            24시간 출동 가능
          </h2>
          <p className="mt-6 text-base text-slate-700 sm:text-lg">
            전화 한 통이면 충분합니다. 사진과 함께 증상을 보내주시면,
            <br className="hidden sm:inline" />
            현장 도착 전부터 진단 방향을 잡아 빠르게 해결해드립니다.
          </p>
        </Reveal>

        <RevealGroup
          stagger={0.12}
          className="mt-12 grid gap-5 sm:grid-cols-3 lg:gap-6"
        >
          <RevealItem variant="up">
            <Card Icon={Phone} big="간편" caption="전화 또는 사진 문의 1회" />
          </RevealItem>
          <RevealItem variant="up">
            <Card Icon={Clock} big="24/365" caption="휴일·새벽 상담 가능" />
          </RevealItem>
          <RevealItem variant="up">
            <Card
              Icon={ShieldCheck}
              big="1년"
              caption="동일 부위 무상 A/S"
            />
          </RevealItem>
        </RevealGroup>

        <Reveal variant="up" delay={0.1}>
          <p className="mt-10 text-center text-base font-bold text-slate-900 sm:text-lg">
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
  Icon: React.ComponentType<{
    className?: string;
    strokeWidth?: number;
    "aria-hidden"?: boolean;
  }>;
  big: string;
  caption: string;
}) {
  return (
    <div className="rounded-2xl bg-white px-7 py-10 text-left shadow-lg sm:px-10 sm:py-12">
      <Icon
        aria-hidden
        className="size-10 text-brand-600 sm:size-12"
        strokeWidth={1.75}
      />
      <div className="mt-5 text-5xl font-black tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
        {big}
      </div>
      <div className="mt-3 text-sm font-semibold text-slate-600 sm:text-base lg:text-lg">
        {caption}
      </div>
    </div>
  );
}
