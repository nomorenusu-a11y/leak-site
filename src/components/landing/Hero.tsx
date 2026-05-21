import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { ContactCTA } from "./CtaButtons";
import { Zap, Check } from "@/components/icons";
import { BUSINESS } from "@/lib/business";

export function Hero({ cityLabel }: { cityLabel: string }) {
  const headline = cityLabel ? `${cityLabel} 누수 전문` : "누수, 정확히 찾아 빠르게 해결";
  const sub = cityLabel
    ? `${cityLabel} 지역 출동 가능. 정밀 장비로 누수 위치를 정확히 진단하고, 꼭 필요한 부분만 시공합니다.`
    : `${BUSINESS.serviceArea} 출동. 정밀 장비로 누수 위치를 정확히 진단하고, 꼭 필요한 부분만 시공합니다. 상담은 24시간 가능.`;

  return (
    <section className="relative isolate overflow-hidden text-white">
      {/* 배경 사진 */}
      <Image
        src="/hero-bg.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover"
      />
      {/* brand 톤 그라데이션 오버레이 — 텍스트 가독성 확보 */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-900/85 via-brand-800/80 to-brand-700/70"
      />
      {/* 좌측 글자 영역에 더 어둡게 한 번 더 (모바일까지 가독성 안정) */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-950/45 via-transparent to-transparent"
      />
      <Container className="relative py-14 sm:py-20 lg:py-24">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide ring-1 ring-inset ring-white/25">
            <Zap aria-hidden className="size-3.5" strokeWidth={2.25} />
            24시간 상담 · {BUSINESS.responseTime} 출동
          </span>
          <h1 className="mt-4 text-4xl font-black leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
            {headline}
          </h1>
          <p className="mt-4 max-w-xl text-base text-white/90 sm:text-lg sm:leading-relaxed">
            {sub}
          </p>

          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-white/95 sm:max-w-md">
            {["비파괴 정밀 탐지", "시공 전 사진 견적", BUSINESS.warranty, BUSINESS.pricing].map(
              (item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check aria-hidden className="size-4 text-accent-300" strokeWidth={3} />
                  {item}
                </li>
              ),
            )}
          </ul>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ContactCTA variant="primary" layout="row" />
          </div>
        </div>
      </Container>
    </section>
  );
}
