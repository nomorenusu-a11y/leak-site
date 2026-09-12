import Image from "next/image";
import { Container } from "@/components/ui/Container";
import {
  Headset,
  Truck,
  FileText,
  BicepsFlexed,
} from "@/components/icons";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { getAboutCards } from "@/lib/site-content";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>> = {
  Headset, Truck, FileText, BicepsFlexed,
};

/**
 * 회사 소개 — 4가지 핵심 약속을 사진 카드로 노출.
 *
 * 각 카드: 사진 + 좌상단 코너에 brand 컬러 원형 아이콘 배지 (Headset/Truck/FileText/BicepsFlexed)
 * + 하단 2줄 굵은 카피.
 */
export async function AboutCards() {
  const cards = await getAboutCards();

  return (
    <section id="about" className="scroll-mt-20 bg-white py-16 md:py-24">
      <Container>
        <Reveal variant="up" className="mx-auto max-w-3xl text-center">
          <p className="section-kicker">NO MORE LEAKS</p>
          <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
            누수를 끝까지 해결하는
            <span className="text-brand-600"> 네 가지 원칙</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            상담부터 출동, 견적, 사후관리까지.
            <br className="sm:hidden" /> 고객이 불안해하지 않도록 과정부터 분명하게 안내합니다.
          </p>
        </Reveal>

        <RevealGroup
          stagger={0.1}
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4 lg:gap-5"
        >
          {cards.map((card) => {
            const Icon = ICON_MAP[card.icon] ?? Headset;
            return (
              <RevealItem key={card.line1} variant="up">
                <article className="group h-full overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-[0_14px_45px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(15,23,42,0.14)]">
                  <div className="relative aspect-[4/3] bg-slate-100 lg:aspect-[4/5]">
                    <Image
                      src={card.src}
                      alt={card.alt}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[#061b35]/75 via-transparent to-transparent" />
                    <span className="absolute left-4 top-4 inline-flex size-10 items-center justify-center rounded-full border border-white/30 bg-[#061b35]/80 text-cyan-300 shadow-md backdrop-blur-md">
                      <Icon
                        aria-hidden
                        className="size-5"
                        strokeWidth={2.25}
                      />
                    </span>
                  </div>
                  <div className="border-t-2 border-cyan-400 px-4 py-5 text-left">
                    <p className="text-base font-black text-slate-950 sm:text-lg">
                      {card.line1}
                    </p>
                    <p className="mt-1 text-sm font-bold text-brand-600 sm:text-base">
                      {card.line2}
                    </p>
                  </div>
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>
    </section>
  );
}
