import { Container } from "@/components/ui/Container";
import { ContactCTA } from "./CtaButtons";
import { BUSINESS } from "@/lib/business";

export function Hero({ cityLabel }: { cityLabel: string }) {
  const headline = cityLabel ? `${cityLabel} 누수 전문` : "누수, 정확히 찾아 빠르게 해결";
  const sub = cityLabel
    ? `${cityLabel} 지역 출동 가능. 정밀 장비로 누수 위치를 정확히 진단하고, 꼭 필요한 부분만 시공합니다.`
    : `${BUSINESS.serviceArea} 출동. 정밀 장비로 누수 위치를 정확히 진단하고, 꼭 필요한 부분만 시공합니다. 상담은 24시간 가능.`;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 text-white">
      {/* subtle pattern */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:24px_24px]"
      />
      <Container className="relative py-14 sm:py-20 lg:py-24">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide ring-1 ring-inset ring-white/25">
            <span aria-hidden>⚡</span> 24시간 상담 · {BUSINESS.responseTime} 출동
          </span>
          <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {headline}
          </h1>
          <p className="mt-4 text-base text-white/85 sm:text-lg sm:leading-relaxed">
            {sub}
          </p>

          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-white/90 sm:max-w-md">
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="text-accent-300">✓</span> 비파괴 정밀 탐지
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="text-accent-300">✓</span> 시공 전 사진 견적
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="text-accent-300">✓</span> {BUSINESS.warranty}
            </li>
            <li className="flex items-center gap-1.5">
              <span aria-hidden className="text-accent-300">✓</span> {BUSINESS.pricing}
            </li>
          </ul>

          <div className="mt-8">
            <ContactCTA variant="primary" layout="row" />
          </div>
        </div>
      </Container>
    </section>
  );
}
