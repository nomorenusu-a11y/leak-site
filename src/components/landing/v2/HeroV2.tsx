import { HeroCarouselClient } from "./HeroCarouselClient";
import { HeroQuickForm } from "./HeroQuickForm";

const HERO_SLIDES = [
  {
    src: "/hero/01-greet.png",
    alt: "전문가의 손길로 완벽하게 해결하는 누수탐지 시공",
    headline: "수도권 전지역\n누수 해결 전문",
    sub: "서울·경기·인천 어디든 빠르게 출동합니다",
  },
  {
    src: "/hero/02-detect.png",
    alt: "집요하게 찾아내는 보이지 않는 문제 — 정밀 탐지 전문가",
    headline: "비파괴 정밀 탐지\n정확한 원인 진단",
    sub: "벽·바닥 손상 없이 누수 위치를 찾아냅니다",
  },
  {
    src: "/hero/03-precise.png",
    alt: "작은 균열까지 타협 없는 정밀 탐지 — 지하 배관 작업 현장",
    headline: "타업체 실패현장\n해결 전문가",
    sub: "어디서도 못 찾은 누수, 저희가 찾아드립니다",
  },
  {
    src: "/hero/04-tech.png",
    alt: "첨단 기술로 실시간 시각화하는 정밀 누수 탐지",
    headline: "최신 장비 보유\n첨단 기술력",
    sub: "열화상·청음기·내시경 등 고가 장비 풀세트 보유",
  },
  {
    src: "/hero/05-scene.png",
    alt: "전문 장비와 디지털 모니터링으로 정확한 누수 진단",
    headline: "365일 24시간\n긴급 출동 가능",
    sub: "새벽·주말·공휴일 상관없이 즉시 출동합니다",
  },
];

export async function HeroV2(_props: { cityLabel?: string }) {
  return (
    <section className="relative isolate bg-slate-900">
      <div className="bg-brand-700 px-4 py-2 text-center text-xs font-bold text-white sm:text-sm">
        <span className="text-cyan-200">✨ 신속함과 정직함으로</span>
        <span className="mx-1.5 text-white/40">|</span>
        <span>수도권 365일 24시간 누수 출동 전문업체</span>
      </div>

      <div className="grid grid-cols-1 items-stretch lg:min-h-[680px] lg:grid-cols-[6fr_4fr] xl:min-h-[720px]">
        {/* 좌측 — 캐러셀 (슬라이드별 문구 포함) */}
        <div className="relative overflow-hidden bg-slate-900">
          <HeroCarouselClient slides={HERO_SLIDES} intervalMs={2800} />
        </div>

        {/* 우측 — 상담 신청폼 */}
        <div className="hidden lg:block">
          <HeroQuickForm />
        </div>
      </div>
    </section>
  );
}
