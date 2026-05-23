import { Container } from "@/components/ui/Container";
import { Truck, BicepsFlexed } from "@/components/icons";
import { siteConfig } from "@/lib/env";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";

type AboutCard = {
  key: string;
  /** 카드 상단의 큰 시각 요소 — 아이콘 또는 텍스트 */
  visual: React.ReactNode;
  body: React.ReactNode;
  highlight: React.ReactNode;
};

/**
 * ABOUT US — "아무나 장인이라 불리지 않습니다" (IMG_1321 레이아웃 참고).
 *
 * 헤드라인 → 서브 카피 → 3대 약속 카드(긴급출동·0원·최신장비).
 * 카드는 brand-600 그라데이션 + 흰 텍스트. 헤더 영역은 흰 배경.
 */
export function MasterSection() {
  const cards: AboutCard[] = [
    {
      key: "dispatch",
      visual: (
        <Truck
          aria-hidden
          className="size-12 text-white sm:size-14"
          strokeWidth={1.75}
        />
      ),
      body: (
        <>
          서울·경기·인천 전지역 어디라도
          <br />
          긴급출동하여 해결해드립니다.
        </>
      ),
      highlight: (
        <>
          수도권 전지역!
          <br />
          365일 긴급출동!
        </>
      ),
    },
    {
      key: "zero",
      visual: (
        <span className="flex items-baseline text-white">
          <span className="text-6xl font-black leading-none sm:text-7xl">0</span>
          <span className="ml-1 text-xl font-extrabold sm:text-2xl">원</span>
        </span>
      ),
      body: (
        <>
          해결하지 못한 현장에 대한 청구비용 0원
          <br />
          보험서류 제공 및 기타 서비스 0원
        </>
      ),
      highlight: (
        <>
          미해결시 비용 0원!
          <br />
          누수보험서류 비용 0원
        </>
      ),
    },
    {
      key: "expert",
      visual: (
        <BicepsFlexed
          aria-hidden
          className="size-12 text-white sm:size-14"
          strokeWidth={1.75}
        />
      ),
      body: (
        <>
          고가의 최신장비들을 보유중이며
          <br />
          베테랑 전문가들이 항시 대기중입니다
        </>
      ),
      highlight: (
        <>
          최신장비 보유!
          <br />
          최고의 인력 상시대기!
        </>
      ),
    },
  ];

  return (
    <section className="bg-white py-10 md:py-14">
      <Container>
        <Reveal variant="up" className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold tracking-wide text-brand-600">ABOUT US</p>
          <h2 className="mt-3 text-2xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-3xl">
            아무나 장인이라 불리지 않습니다
            <br />
            오직 전문가만이 장인이라 할 수 있습니다
          </h2>
          <p className="mt-5 text-slate-600">
            {siteConfig.name}을 선택해주신 고객님들께서 후회하지 않도록
          </p>
          <p className="mt-3 text-xl font-extrabold text-slate-900 sm:text-2xl">
            <span className="text-brand-600">깔끔하게! 100%!</span>{" "}
            해결해드리겠습니다.
          </p>
        </Reveal>

        <RevealGroup
          stagger={0.1}
          className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {cards.map((card) => (
            <RevealItem key={card.key} variant="up">
              <article className="flex h-full flex-col items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 px-6 py-8 text-center text-white shadow-md">
                <div className="flex h-20 items-center justify-center sm:h-24">
                  {card.visual}
                </div>
                <p className="mt-5 text-sm leading-relaxed text-white/85">
                  {card.body}
                </p>
                <p className="mt-5 text-lg font-extrabold leading-snug sm:text-xl">
                  {card.highlight}
                </p>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>
      </Container>
    </section>
  );
}
