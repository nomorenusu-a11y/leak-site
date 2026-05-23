import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/env";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

type AboutCard = {
  src: string;
  alt: string;
  line1: string;
  line2: string;
};

const CARDS: AboutCard[] = [
  {
    src: "/about/consult.png",
    alt: "전문 상담센터에서 헤드셋을 끼고 상담 중인 모습",
    line1: "365일 무료상담",
    line2: "친절 견적상담",
  },
  {
    src: "/about/dispatch.png",
    alt: "야간 긴급 출동을 위해 운전 중인 누수탐지 전문기사",
    line1: "365일 24시간",
    line2: "신속! 긴급출동",
  },
  {
    src: "/about/estimate.png",
    alt: "현장에서 태블릿으로 누수 견적서를 보여주며 설명하는 모습",
    line1: "정직한 견적!",
    line2: "확실한 A/S",
  },
  {
    src: "/about/rescue.png",
    alt: "탐지 장비와 함께 작업을 마치고 OK 사인을 보내는 마스터",
    line1: "타업체 실패현장",
    line2: "해결 전문가!",
  },
];

/**
 * 회사 소개 — 4가지 핵심 약속을 사진 카드로 노출.
 *
 * 레퍼런스: NJ 누수장인 회사소개 레이아웃 (4-up 카드, 사진 위 / 2줄 카피 아래).
 * 톤은 사이트 컬러(brand-700) 톤 다운 헤더 + 흰 카드.
 */
export function AboutCards() {
  return (
    <section id="about" className="scroll-mt-20 bg-slate-50 py-16 md:py-20">
      <Container>
        <Reveal variant="up" className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold tracking-wide text-brand-600">ABOUT</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {siteConfig.name} 회사소개
          </h2>
          <p className="mt-3 text-slate-600">
            {siteConfig.name}은 아래와 같은 혜택을 제공합니다.
          </p>
        </Reveal>

        <RevealGroup
          stagger={0.1}
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {CARDS.map((card) => (
            <RevealItem key={card.line1} variant="up">
              <article className="group h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
                <div className="relative aspect-square bg-slate-100">
                  <Image
                    src={card.src}
                    alt={card.alt}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="px-4 py-5 text-center">
                  <p className="text-base font-extrabold text-slate-900 sm:text-lg">
                    {card.line1}
                  </p>
                  <p className="mt-0.5 text-base font-extrabold text-slate-900 sm:text-lg">
                    {card.line2}
                  </p>
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
