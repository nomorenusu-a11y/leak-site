import { Star } from "@/components/icons";
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
 * Hero v2 — 광고 LP 톤 7:3 분할.
 *
 * PC (lg+):
 *   - 상단 brand-700 띠 (한 줄 메시지)
 *   - 좌 70% bg-brand-600 — 캐러셀(5장 자동 슬라이드) + star sparkle 데코
 *   - 우 30% 흰 배경 — 상담 신청폼 (로고·이름·연락처·동의·CTA·전화번호)
 *   - min-h-[640px] lg:min-h-[720px] 풀스크린에 가까운 비율
 *
 * 모바일:
 *   - 띠 → 캐러셀(자연 aspect) — 폼은 hidden (MobileBottomBar가 CTA 담당)
 */
export async function HeroV2(_props: { cityLabel?: string }) {
  return (
    <section className="relative isolate bg-slate-900">
      {/* 상단 한 줄 띠 */}
      <div className="bg-brand-700 px-4 py-2 text-center text-xs font-bold text-white sm:text-sm">
        <span className="text-cyan-200">✨ 신속함과 정직함으로</span>
        <span className="mx-1.5 text-white/40">|</span>
        <span>수도권 365일 24시간 누수 출동 전문업체</span>
      </div>

      {/* 메인 — 7:3 분할 */}
      <div className="grid grid-cols-1 items-stretch lg:min-h-[680px] lg:grid-cols-[7fr_3fr] xl:min-h-[720px]">
        {/* 좌측 — 캐러셀 + 데코 */}
        <div className="relative overflow-hidden bg-brand-600">
          {/* 별 sparkle 데코 (좌상단) */}
          <span
            aria-hidden
            className="absolute left-4 top-4 z-10 inline-flex items-center justify-center text-yellow-300 drop-shadow sm:left-6 sm:top-6"
          >
            <Star
              className="size-6 fill-yellow-300 sm:size-8"
              strokeWidth={1}
            />
          </span>
          {/* 우상단 light 블롭 */}
          <div
            aria-hidden
            className="absolute -right-32 -top-24 size-[24rem] rounded-full bg-cyan-300/15 blur-3xl"
          />
          <HeroCarouselClient slides={HERO_SLIDES} intervalMs={4000} />
        </div>

        {/* 우측 — 상담 신청 폼 (모바일 숨김) */}
        <div className="hidden lg:block">
          <HeroQuickForm />
        </div>
      </div>
    </section>
  );
}
