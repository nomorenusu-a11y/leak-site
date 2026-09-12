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
  const [HERO_SLIDES, heroBanner] = await Promise.all([
    getHeroSlides(),
    getHeroBanner(),
  ]);
  const real = await getRecentBoardItems(REAL_LIMIT);
  const realItems: ScrollItem[] = real.map((item) => ({
    ...item,
    time_variant: "relative" as const,
  }));
  const demoItems = LIVE_BOARD_DEMO_ON ? buildScrollPool(new Date()) : [];
  const initial: ScrollItem[] = [...realItems, ...demoItems];
  const phone = BUSINESS.contact.phone;

  return (
    <section className="brand-grid relative isolate overflow-hidden bg-[#04172e]">
      <div className="border-b border-cyan-300/20 bg-gradient-to-r from-[#0751b5] via-brand-600 to-cyan-600 px-4 py-2.5 text-center text-xs font-extrabold text-white sm:text-sm">
        <span className="text-cyan-200">{heroBanner.highlight}</span>
        <span className="mx-1.5 text-white/40">|</span>
        <span>{heroBanner.text}</span>
      </div>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 items-stretch lg:min-h-[680px] lg:grid-cols-[1.45fr_0.75fr] xl:min-h-[720px]">
        {/* 좌측 — 캐러셀 */}
        <div className="relative h-[70vw] max-h-[440px] overflow-hidden bg-slate-900 sm:h-[50vw] sm:max-h-[440px] lg:h-auto lg:max-h-none">
          <HeroCarouselClient slides={HERO_SLIDES} intervalMs={2800} />
        </div>

        {/* 우측/하단 — 실시간 접수현황 */}
        <aside className="flex min-h-[560px] flex-col overflow-hidden border-t border-white/10 bg-white shadow-2xl lg:min-h-0 lg:border-l lg:border-t-0">
          <div className="min-h-0 flex-1 overflow-hidden [&>div]:rounded-none [&>div]:border-0 [&>div]:shadow-none">
            {initial.length > 0 ? (
              <LiveStatusTableClient initial={initial} rows={8} intervalMs={2500} />
            ) : (
              <div className="flex h-full items-center justify-center px-5 text-sm font-semibold text-slate-500">
                작업이 등록되면 여기에 실시간으로 표시됩니다.
              </div>
            )}
          </div>

          <div className="shrink-0 space-y-2 border-t border-slate-200 bg-[#071e3d] px-4 py-3 sm:px-5">
            {phone && (
              <a
                href={`tel:${phone.tel}`}
                className="block rounded-xl border border-cyan-300/30 bg-white/5 px-3 py-2.5 text-center transition hover:bg-white/10"
              >
                <span className="block text-[10px] font-extrabold uppercase tracking-[0.18em] text-cyan-300">
                  긴급출동 직통
                </span>
                <span className="mt-1 inline-flex items-center gap-1.5 text-lg font-black tracking-tight text-white sm:text-2xl">
                  <Phone aria-hidden className="size-5" strokeWidth={2.5} />
                  {phone.display}
                </span>
              </a>
            )}
            <a
              href={BUSINESS.kakaoChatUrl}
              target="_blank"
              rel="noopener"
                className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] text-sm font-extrabold text-[#3C1E1E] shadow-md transition hover:brightness-95"
            >
              <KakaoLogo aria-hidden className="size-5" />
              <span>카카오톡으로 빠른 상담</span>
            </a>
          </div>
        </aside>
      </div>
    </section>
  );
}
