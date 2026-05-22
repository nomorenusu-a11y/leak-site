import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Phone, ShieldCheck, Wrench } from "@/components/icons";
import { BUSINESS } from "@/lib/business";
import { QuoteFallbackButton } from "../CtaButtons";

/**
 * Hero v2 — 장인케어 톤 (브랜드 파랑 그라데이션 + 큰 전화 아이콘).
 *
 * 전화번호가 설정돼 있으면 큰 동그란 전화 아이콘 + 안내 문구를 노출.
 * 없으면 견적 폼 fallback CTA로 자연 대체.
 */
export function HeroV2({ cityLabel }: { cityLabel: string }) {
  const phone = BUSINESS.contact.phone;
  const headline = cityLabel ? `${cityLabel} 누수 · 시공 빠르게 해결` : "누수 · 시공 빠르게 해결";

  return (
    <section className="relative isolate overflow-hidden text-white">
      {/* 브랜드 파랑 그라데이션 (배경 사진 대신) */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800"
      />
      {/* 우상단 라이트 오버레이 — 깊이감 */}
      <div
        aria-hidden
        className="absolute -right-32 -top-24 -z-10 size-[28rem] rounded-full bg-white/10 blur-3xl"
      />
      <Container className="relative py-12 sm:py-16 lg:py-20">
        <div className="grid items-center gap-8 md:grid-cols-[1.2fr_1fr] md:gap-10">
          {/* 좌측 — 카피 */}
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wide ring-1 ring-inset ring-white/30">
              24시간 상담 · {BUSINESS.responseTime} 출동
            </span>
            <h1 className="mt-4 text-4xl font-black leading-[1.15] tracking-tight sm:text-5xl lg:text-[3.5rem]">
              {headline}
            </h1>
            <p className="mt-4 text-base font-semibold text-white/95 sm:text-lg">
              최신 장비와 전문 마스터 보유
            </p>
            <ul className="mt-4 space-y-1.5 text-sm text-white/85 sm:text-base">
              <li className="flex items-center gap-2">
                <ShieldCheck aria-hidden className="size-4 text-accent-300" strokeWidth={2.5} />
                비파괴 정밀 진단 · 최소 시공
              </li>
              <li className="flex items-center gap-2">
                <Wrench aria-hidden className="size-4 text-accent-300" strokeWidth={2.5} />
                {BUSINESS.warranty} · {BUSINESS.pricing}
              </li>
            </ul>
            <p className="mt-3 text-xs text-white/65">
              * 작업환경과 상황에 따라 달라질 수 있습니다.
            </p>
          </div>

          {/* 우측 — 큰 전화 아이콘 (또는 견적 fallback) */}
          <div className="flex flex-col items-center justify-center md:items-end">
            {phone ? (
              <a
                href={`tel:${phone.tel}`}
                aria-label={`전화 ${phone.display}로 상담`}
                className="group flex flex-col items-center gap-3 rounded-3xl bg-white/10 px-7 py-6 ring-1 ring-inset ring-white/25 backdrop-blur transition-colors hover:bg-white/20"
              >
                <span className="flex size-24 items-center justify-center rounded-full bg-white text-brand-700 shadow-lg shadow-brand-950/30 transition-transform group-hover:scale-105 sm:size-28">
                  <Phone className="size-12 sm:size-14" strokeWidth={2.25} aria-hidden />
                </span>
                <span className="text-center">
                  <span className="block text-2xl font-black tracking-tight sm:text-3xl">
                    {phone.display}
                  </span>
                  <span className="mt-1 block text-xs text-white/85">
                    터치 시 바로 전화로 연결됩니다
                  </span>
                </span>
              </a>
            ) : (
              <QuoteFallbackButton block label="1분 견적 받기" />
            )}
          </div>
        </div>
      </Container>
      {/* 하단 작은 일러스트 자리 — 현재는 빈 화이트 라인 */}
      <Image
        src="/hero-bg.jpg"
        alt=""
        width={1200}
        height={120}
        priority
        sizes="100vw"
        className="-z-20 absolute inset-x-0 bottom-0 h-32 w-full object-cover opacity-30"
      />
    </section>
  );
}
