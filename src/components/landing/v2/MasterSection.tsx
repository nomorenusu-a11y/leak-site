import { Container } from "@/components/ui/Container";
import { Truck, BicepsFlexed } from "@/components/icons";
import { siteConfig } from "@/lib/env";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { getMasterSection } from "@/lib/site-content";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>> = {
  Truck, BicepsFlexed,
};

export async function MasterSection() {
  const data = await getMasterSection();
  const titleLines = data.title.split("\n");

  return (
    <section className="brand-grid relative overflow-hidden bg-[#061b35] py-16 text-white md:py-24">
      <div aria-hidden className="absolute -left-40 top-10 size-96 rounded-full bg-brand-500/15 blur-3xl" />
      <Container>
        <Reveal variant="up" className="relative mx-auto max-w-3xl text-center">
          <p className="section-kicker section-kicker-dark">OUR PROMISE</p>
          <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
            {titleLines.map((line, i) => (
              <span key={i}>{i > 0 && <br />}{line}</span>
            ))}
          </h2>
          <p className="mt-6 text-base leading-7 text-slate-300 sm:text-lg">
            {siteConfig.name}{data.subtitle}
          </p>
          <p className="mt-3 text-xl font-black text-white sm:text-2xl">
            <span className="text-cyan-300">{data.cta}</span>
          </p>
        </Reveal>

        <RevealGroup
          stagger={0.1}
          className="relative mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 lg:gap-5"
        >
          {data.cards.map((card) => {
            const Icon = ICON_MAP[card.icon];
            const visual = card.visualText ? (
              <span className="flex items-baseline text-white">
                <span className="text-6xl font-black leading-none sm:text-7xl">{card.visualText.replace("원", "")}</span>
                {card.visualText.includes("원") && <span className="ml-1 text-xl font-extrabold sm:text-2xl">원</span>}
              </span>
            ) : Icon ? (
              <Icon aria-hidden className="size-12 text-white sm:size-14" strokeWidth={1.75} />
            ) : null;

            return (
              <RevealItem key={card.key} variant="up">
                <article className="flex h-full flex-col items-center rounded-[1.4rem] border border-white/10 bg-white/[0.06] px-6 py-8 text-center text-white shadow-2xl shadow-black/10 backdrop-blur-sm transition hover:border-cyan-300/30 hover:bg-white/[0.09] sm:px-8 sm:py-10">
                  <div className="flex h-20 items-center justify-center sm:h-24">
                    {visual}
                  </div>
                  <p className="mt-5 text-sm leading-7 text-slate-300">
                    {card.body.split("\n").map((line, i) => (
                      <span key={i}>{i > 0 && <br />}{line}</span>
                    ))}
                  </p>
                  <p className="mt-5 border-t border-white/10 pt-5 text-lg font-black leading-snug text-cyan-200 sm:text-xl">
                    {card.highlight.split("\n").map((line, i) => (
                      <span key={i}>{i > 0 && <br />}{line}</span>
                    ))}
                  </p>
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </Container>
    </section>
  );
}
