import { HeroCarouselClient } from "./HeroCarouselClient";
import { HeroQuickForm } from "./HeroQuickForm";

const HERO_SLIDES = [
  {
    src: "/hero/01-greet.png",
    alt: "전문가의 손길로 완벽하게 해결하는 유레카설비 & 누수탐지",
  },
  {
    src: "/hero/02-detect.png",
    alt: "집요하게 찾아내는 보이지 않는 문제, 진정한 전문가의 기술",
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
 * Hero v2 — 좌 캐러셀(꽉채움) + 우 빠른 문의폼 단독 구성.
 *
 * 다른 모든 요소(LIVE 띠·trust strip·스크롤 화살표) 제거 →
 * 캐러셀과 폼만 hero를 가득 채움. example 레이아웃 톤.
 *
 * PC:   grid-cols-[4fr_1fr] (80:20)
 * 모바일: 단일 컬럼 스택 — 캐러셀 위 / 폼 아래
 */
export async function HeroV2(_props: { cityLabel?: string }) {
  return (
    <section className="relative isolate bg-slate-900">
      {/* 상단 멘트 — 한 줄 띠 */}
      <div className="bg-brand-700 px-4 py-2 text-center text-xs font-bold text-white sm:text-sm">
        <span className="text-cyan-200">✨ 신속함과 정직함으로</span>
        <span className="mx-1.5 text-white/40">|</span>
        <span>수도권 365일 24시간 누수 출동 전문업체</span>
      </div>

      <div className="grid grid-cols-1 items-stretch lg:grid-cols-[4fr_1fr]">
        <HeroCarouselClient slides={HERO_SLIDES} intervalMs={3500} />
        <HeroQuickForm />
      </div>
    </section>
  );
}
