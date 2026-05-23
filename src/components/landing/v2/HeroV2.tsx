import { HeroCarouselClient } from "./HeroCarouselClient";
import { LiveStatusTableClient } from "./LiveStatusTableClient";
import { LIVE_BOARD_DEMO_ON } from "@/lib/env";
import { buildScrollPool, type ScrollItem } from "@/lib/live-board-scroll";
import { getRecentBoardItems } from "@/lib/posts";
import { Phone } from "@/components/icons";
import { KakaoLogo } from "@/components/icons/BrandLogos";
import { BUSINESS } from "@/lib/business";

const HERO_SLIDES = [
  {
    src: "/about/dispatch.png",
    alt: "긴급 출동 중인 누수탐지 전문기사",
    headline: "365일 24시간\n긴급 출동",
    sub: "서울·경기·인천 수도권 전지역 신속 대응",
  },
  {
    src: "/about/rescue.png",
    alt: "작업 완료 후 OK 사인을 보내는 전문가",
    headline: "타업체 실패현장\n해결 전문",
    sub: "어디서도 못 찾은 누수, 저희가 끝냅니다",
  },
  {
    src: "/about/estimate.png",
    alt: "현장에서 견적서를 설명하는 모습",
    headline: "정직한 견적\n확실한 A/S",
    sub: "미해결 시 비용 0원 · 보험서류 무상 제공",
  },
  {
    src: "/about/consult.png",
    alt: "전문 상담센터에서 상담 중",
    headline: "전화 한 통이면\n전문가가 찾아갑니다",
    sub: "사진과 증상만 보내주세요, 바로 진단 시작",
  },
];

const REAL_LIMIT = 40;

export async function HeroV2(_props: { cityLabel?: string }) {
  const real = await getRecentBoardItems(REAL_LIMIT);
  const realItems: ScrollItem[] = real.map((r) => ({
    ...r,
    time_variant: "relative" as const,
  }));
  const demoItems = LIVE_BOARD_DEMO_ON ? buildScrollPool(new Date()) : [];
  const initial: ScrollItem[] = [...realItems, ...demoItems];
  const phone = BUSINESS.contact.phone;

  return (
    <section className="relative isolate bg-slate-900">
      <div className="bg-brand-700 px-4 py-2 text-center text-xs font-bold text-white sm:text-sm">
        <span className="text-cyan-200">✨ 신속함과 정직함으로</span>
        <span className="mx-1.5 text-white/40">|</span>
        <span>수도권 365일 24시간 누수 출동 전문업체</span>
      </div>

      <div className="grid grid-cols-1 items-stretch lg:min-h-[640px] lg:grid-cols-[6fr_4fr] xl:min-h-[700px]">
        {/* 좌측 — 캐러셀 */}
        <div className="relative overflow-hidden bg-slate-900">
          <HeroCarouselClient slides={HERO_SLIDES} intervalMs={2800} />
        </div>

        {/* 우측 — 실시간 견적현황 */}
        <div className="flex flex-col bg-white shadow-2xl shadow-black/10">
          <div className="bg-brand-700 px-6 py-4 text-center text-white">
            <p className="text-xs font-extrabold uppercase tracking-widest text-cyan-200">
              LIVE
            </p>
            <p className="mt-1 text-base font-extrabold tracking-tight sm:text-lg">
              실시간 견적현황
            </p>
          </div>

          <div className="flex-1 overflow-hidden p-3 lg:p-4">
            {initial.length > 0 ? (
              <LiveStatusTableClient
                initial={initial}
                rows={6}
                intervalMs={2500}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                현재 접수된 견적이 없습니다
              </div>
            )}
          </div>

          <div className="mt-auto space-y-2.5 border-t border-slate-100 px-4 py-3 lg:px-5">
            {phone && (
              <a
                href={`tel:${phone.tel}`}
                className="block rounded-xl border-2 border-brand-200 bg-brand-50 px-3 py-3 text-center hover:bg-brand-100"
              >
                <span className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-600">
                  긴급출동 직통
                </span>
                <span className="mt-0.5 inline-flex items-center gap-1.5 text-xl font-black tracking-tight text-brand-900 sm:text-2xl">
                  <Phone aria-hidden className="size-5" strokeWidth={2.5} />
                  {phone.display}
                </span>
              </a>
            )}
            <a
              href={BUSINESS.kakaoChatUrl}
              target="_blank"
              rel="noopener"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#FEE500] text-sm font-extrabold text-[#3C1E1E] shadow-md transition hover:brightness-95"
            >
              <KakaoLogo aria-hidden className="size-5" />
              <span>카카오톡으로 빠른 상담</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
