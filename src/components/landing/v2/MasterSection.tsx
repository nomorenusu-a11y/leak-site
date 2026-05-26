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
    <section className="bg-white py-8 md:py-12">
      <Container>
        <Reveal variant="up" className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold tracking-wide text-brand-600">ABOUT US</p>
          <h2 className="mt-3 text-2xl font-extrabold leading-snug tracking-tight text-slate-900 sm:text-3xl">
            {titleLines.map((line, i) => (
              <span key={i}>{i > 0 && <br />}{line}</span>
            ))}
          </h2>
          <p className="mt-5 text-slate-600">
            {siteConfig.name}{data.subtitle}
          </p>
          <p className="mt-3 text-xl font-extrabold text-slate-900 sm:text-2xl">
            <span className="text-brand-600">{data.cta}</span>
          </p>
        </Reveal>

        <RevealGroup
          stagger={0.1}
          className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
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
                <article className="flex h-full flex-col items-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 px-6 py-8 text-center text-white shadow-md">
                  <div className="flex h-20 items-center justify-center sm:h-24">
                    {visual}
                  </div>
                  <p className="mt-5 text-sm leading-relaxed text-white/85">
                    {card.body.split("\n").map((line, i) => (
                      <span key={i}>{i > 0 && <br />}{line}</span>
                    ))}
                  </p>
                  <p className="mt-5 text-lg font-extrabold leading-snug sm:text-xl">
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
