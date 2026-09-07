import { HeroCarouselClient } from "./HeroCarouselClient";
import { LiveStatusTableClient } from "./LiveStatusTableClient";
import { LIVE_BOARD_DEMO_ON } from "@/lib/env";
import { buildScrollPool, type ScrollItem } from "@/lib/live-board-scroll";
import { getRecentBoardItems } from "@/lib/posts";
import { Phone } from "@/components/icons";
import { KakaoLogo } from "@/components/icons/BrandLogos";
import { BUSINESS } from "@/lib/business";
import { getHeroSlides, getHeroBanner } from "@/lib/site-content";

const REAL_LIMIT = 40;

export async function HeroV2({ cityLabel }: { cityLabel?: string }) {
  void cityLabel;
  const [HERO_SLIDES, heroBanner] = await Promise.all([getHeroSlides(), getHeroBanner()]);
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
        <span className="text-cyan-200">{heroBanner.highlight}</span>
        <span className="mx-1.5 text-white/40">|</span>
        <span>{heroBanner.text}</span>
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
