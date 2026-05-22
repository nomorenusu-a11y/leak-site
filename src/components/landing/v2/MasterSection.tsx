import { Container } from "@/components/ui/Container";
import { MapPin, ShieldCheck, UserCheck, Clock } from "@/components/icons";
import { BUSINESS } from "@/lib/business";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

/**
 * "우리는 장인" — 서비스 지역·운영 시간·신뢰 카피 (장인케어 톤).
 *
 * 측정 불가능한 표현은 피하고, business.ts 카피만 노출.
 */
export function MasterSection() {
  const items = [
    {
      Icon: MapPin,
      title: "출동 지역",
      body: BUSINESS.serviceArea,
    },
    {
      Icon: Clock,
      title: "운영 시간",
      body: "24시간 365일 상담",
    },
    {
      Icon: UserCheck,
      title: "직접 시공",
      body: `${BUSINESS.experience} 마스터가 직접 방문`,
    },
    {
      Icon: ShieldCheck,
      title: "보장",
      body: `${BUSINESS.warranty} · ${BUSINESS.pricing}`,
    },
  ];

  return (
    <section className="bg-brand-700 py-16 text-white md:py-20">
      <Container>
        <Reveal variant="up" className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold tracking-wide text-accent-300">ABOUT US</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            우리는 장인입니다
          </h2>
          <p className="mt-3 text-white/85">
            {BUSINESS.serviceArea} 365일 출동. 외주·신입 파견 없이
            <br className="hidden sm:inline" />
            동일한 마스터가 처음부터 끝까지 직접 진행합니다.
          </p>
        </Reveal>

        <RevealGroup
          stagger={0.1}
          className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {items.map(({ Icon, title, body }) => (
            <RevealItem key={title} variant="scale">
              <div className="h-full rounded-2xl bg-white/10 px-5 py-5 ring-1 ring-inset ring-white/15">
                <Icon aria-hidden className="size-7 text-accent-300" strokeWidth={2} />
                <h3 className="mt-3 text-base font-bold">{title}</h3>
                <p className="mt-1 text-sm text-white/85">{body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
