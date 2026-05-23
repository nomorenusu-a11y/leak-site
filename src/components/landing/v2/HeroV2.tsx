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
    tag: "24시간 긴급출동",
    tagColor: "bg-cyan-500/30 text-cyan-200",
    line1: "365일 24시간",
    line2: "긴급 출동",
    line2Color: "text-yellow-300",
    sub: "서울·경기·인천 수도권 전지역 | 접수 후 30분 내 출동",
    hashtags: ["24시간출동", "수도권전지역", "긴급누수", "야간출동"],
  },
  {
    src: "/about/rescue.png",
    alt: "작업 완료 후 OK 사인을 보내는 전문가",
    tag: "실패현장 전문",
    tagColor: "bg-rose-500/30 text-rose-200",
    line1: "타업체 실패현장",
    line2: "해결 전문",
    line2Color: "text-emerald-300",
    sub: "다른 업체에서 못 찾은 누수도 끝까지 찾아냅니다",
    hashtags: ["실패현장해결", "베테랑전문가", "완벽시공", "비파괴탐지"],
  },
  {
    src: "/about/estimate.png",
    alt: "현장에서 견적서를 설명하는 모습",
    tag: "정직한 시공",
    tagColor: "bg-amber-500/30 text-amber-200",
    line1: "정직한 견적",
    line2: "확실한 A/S",
    line2Color: "text-amber-300",
    sub: "미해결 시 비용 0원 · 보험서류 무상 제공 · 1년 무상 A/S",
    hashtags: ["정직견적", "비용0원", "1년무상AS", "보험서류무상"],
  },
  {
    src: "/about/consult.png",
    alt: "전문 상담센터에서 상담 중",
    tag: "무료 상담",
    tagColor: "bg-blue-500/30 text-blue-200",
    line1: "전화 한 통이면",
    line2: "전문가가 찾아갑니다",
    line2Color: "text-cyan-300",
    sub: "사진과 증상만 보내주세요 · 현장 도착 전 사전 진단 완료",
    hashtags: ["무료상담", "30분내회신", "비파괴탐지", "누수보험"],
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

      <div className="grid grid-cols-1 items-stretch lg:min-h-[680px] lg:grid-cols-[6fr_4fr] xl:min-h-[740px]">
        {/* 좌측 — 캐러셀 */}
        <div className="relative h-[70vw] max-h-[440px] overflow-hidden bg-slate-900 sm:h-[50vw] sm:max-h-[440px] lg:h-auto lg:max-h-none">
          <HeroCarouselClient slides={HERO_SLIDES} intervalMs={2800} />
        </div>

        {/* 우측/하단 — 실시간 견적현황 */}
        <div className="flex max-h-[360px] flex-col bg-white shadow-2xl shadow-black/10 lg:max-h-none">
          <div className="min-h-0 flex-1 overflow-hidden [&>div]:rounded-none [&>div]:border-0 [&>div]:shadow-none">
            {initial.length > 0 ? (
              <LiveStatusTableClient
                initial={initial}
                rows={8}
                intervalMs={2500}
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                현재 접수된 견적이 없습니다
              </div>
            )}
          </div>

          <div className="shrink-0 space-y-2 border-t border-slate-100 px-4 py-2.5 lg:space-y-2.5 lg:px-5 lg:py-3">
            {phone && (
              <a
                href={`tel:${phone.tel}`}
                className="block rounded-xl border-2 border-brand-200 bg-brand-50 px-3 py-2.5 text-center hover:bg-brand-100 lg:py-3"
              >
                <span className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-600">
                  긴급출동 직통
                </span>
                <span className="mt-0.5 inline-flex items-center gap-1.5 text-lg font-black tracking-tight text-brand-900 sm:text-2xl">
                  <Phone aria-hidden className="size-5" strokeWidth={2.5} />
                  {phone.display}
                </span>
              </a>
            )}
            <a
              href={BUSINESS.kakaoChatUrl}
              target="_blank"
              rel="noopener"
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#FEE500] text-sm font-extrabold text-[#3C1E1E] shadow-md transition hover:brightness-95 lg:h-11"
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
