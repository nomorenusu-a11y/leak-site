import { HeroCarouselClient } from "./HeroCarouselClient";
import { Camera, Check, Headset, Phone } from "@/components/icons";
import { KakaoLogo } from "@/components/icons/BrandLogos";
import { BUSINESS } from "@/lib/business";
import { getHeroSlides, getHeroBanner } from "@/lib/site-content";

export async function HeroV2({ cityLabel }: { cityLabel?: string }) {
  void cityLabel;
  const [HERO_SLIDES, heroBanner] = await Promise.all([
    getHeroSlides(),
    getHeroBanner(),
  ]);
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

        {/* 우측/하단 — 고객이 바로 이해하는 상담 안내 */}
        <aside className="flex flex-col bg-white px-5 py-7 shadow-2xl shadow-black/10 sm:px-8 sm:py-9 lg:justify-center">
          <div className="mx-auto w-full max-w-md">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-extrabold text-brand-700">
              <Headset aria-hidden className="size-4" strokeWidth={2.5} />
              빠른 상담 안내
            </div>
            <h2 className="mt-4 text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-3xl">
              누수 증상을 알려주시면
              <br />
              점검 방향부터 안내합니다.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
              물이 새는 위치와 증상이 보이는 사진 한 장만 있어도 괜찮습니다.
              현장 상황을 먼저 듣고 필요한 점검 순서를 설명드립니다.
            </p>

            <ol className="mt-6 space-y-3">
              {[
                "사진 또는 증상을 알려주세요",
                "원인 가능성과 점검 방향을 안내합니다",
                "현장 확인 후 필요한 보수만 진행합니다",
              ].map((step, index) => (
                <li
                  key={step}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3 text-sm font-bold text-slate-800"
                >
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-black text-white">
                    {index + 1}
                  </span>
                  {index === 0 && <Camera aria-hidden className="size-4 shrink-0 text-brand-600" />}
                  {index === 1 && <Headset aria-hidden className="size-4 shrink-0 text-brand-600" />}
                  {index === 2 && <Check aria-hidden className="size-4 shrink-0 text-brand-600" strokeWidth={3} />}
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-6 space-y-2.5 border-t border-slate-100 pt-5">
            {phone && (
              <a
                href={`tel:${phone.tel}`}
                className="block rounded-xl border-2 border-brand-200 bg-brand-50 px-3 py-3 text-center transition hover:bg-brand-100"
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
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FEE500] text-sm font-extrabold text-[#3C1E1E] shadow-md transition hover:brightness-95"
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
