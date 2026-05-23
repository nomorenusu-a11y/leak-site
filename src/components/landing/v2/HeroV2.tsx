import { Star } from "@/components/icons";
import { HeroCarouselClient } from "./HeroCarouselClient";
import { HeroQuickForm } from "./HeroQuickForm";

const HERO_SLIDES = [
  {
    src: "/hero/01-greet.png",
    alt: "전문가의 손길로 완벽하게 해결하는 누수탐지 시공",
  },
  {
    src: "/hero/02-detect.png",
    alt: "집요하게 찾아내는 보이지 않는 문제 — 정밀 탐지 전문가",
  },
  {
    src: "/hero/03-precise.png",
    alt: "작은 균열까지 타협 없는 정밀 탐지 — 지하 배관 작업 현장",
  },
  {
    src: "/hero/04-tech.png",
    alt: "첨단 기술로 실시간 시각화하는 정밀 누수 탐지",
  },
  {
    src: "/hero/05-scene.png",
    alt: "전문 장비와 디지털 모니터링으로 정확한 누수 진단",
  },
];

/**
 * Hero v2 — 광고 LP 톤 7:3 분할.
 *
 * 좌측에 강조 슬로건 + 어두운 좌측→우측 그라데이션 오버레이로
 * 캐러셀 이미지 위 임베드 브랜드 텍스트 무력화 + 카피 가독성 보강.
 */
export async function HeroV2(_props: { cityLabel?: string }) {
  return (
    <section className="relative isolate bg-slate-900">
      <div className="bg-brand-700 px-4 py-2 text-center text-xs font-bold text-white sm:text-sm">
        <span className="text-cyan-200">✨ 신속함과 정직함으로</span>
        <span className="mx-1.5 text-white/40">|</span>
        <span>수도권 365일 24시간 누수 출동 전문업체</span>
      </div>

      <div className="grid grid-cols-1 items-stretch lg:min-h-[640px] lg:grid-cols-[7fr_3fr] xl:min-h-[680px]">
        {/* 좌측 — 캐러셀 + 슬로건 오버레이 */}
        <div className="relative overflow-hidden bg-brand-600">
          <HeroCarouselClient slides={HERO_SLIDES} intervalMs={4000} />

          {/* 좌측 그라데이션 오버레이 — 임베드 텍스트 무력화 + 슬로건 가독성 */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/65 via-black/30 to-transparent"
          />
          {/* 모바일에서는 상단 그라데이션도 추가 */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-transparent lg:hidden"
          />

          {/* 별 sparkle 데코 */}
          <span
            aria-hidden
            className="absolute left-4 top-4 z-10 inline-flex items-center justify-center text-yellow-300 drop-shadow sm:left-6 sm:top-6"
          >
            <Star
              className="size-6 fill-yellow-300 sm:size-8"
              strokeWidth={1}
            />
          </span>

          {/* 강조 슬로건 — PC: 좌측 중앙 / 모바일: 상단 */}
          <div className="absolute inset-x-0 top-12 z-10 px-5 sm:top-14 sm:px-8 lg:inset-y-0 lg:top-auto lg:flex lg:max-w-[58%] lg:flex-col lg:justify-center lg:px-12">
            <p className="text-xs font-bold uppercase tracking-widest text-cyan-200 drop-shadow sm:text-sm">
              수도권 24시간 누수 출동
            </p>
            <h1 className="mt-2 max-w-md text-2xl font-black leading-[1.2] tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)] sm:max-w-lg sm:text-3xl lg:max-w-xl lg:text-4xl xl:text-[2.75rem]">
              집요하게 찾아내는 보이지 않는 문제,
              <br className="hidden sm:block" />
              <span className="text-yellow-300"> 진정한 전문가</span>
              의 기술입니다.
            </h1>
            <p className="mt-3 hidden text-sm font-semibold text-white/90 drop-shadow sm:text-base lg:block">
              비파괴 정밀 장비로 벽·바닥 손상 없이 정확한 위치만 진단합니다.
            </p>
          </div>
        </div>

        {/* 우측 — 상담 신청폼 (모바일 숨김) */}
        <div className="hidden lg:block">
          <HeroQuickForm />
        </div>
      </div>
    </section>
  );
}
