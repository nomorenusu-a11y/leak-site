import { Container } from "@/components/ui/Container";
import { Clock, ShieldCheck, Phone } from "@/components/icons";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { getTimeSection } from "@/lib/site-content";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number; "aria-hidden"?: boolean }>> = {
  Clock, ShieldCheck, Phone,
};

export async function TimeEmphasis() {
  const data = await getTimeSection();

  return (
    <section className="bg-slate-50 py-8 md:py-12">
      <Container>
        <Reveal variant="up" className="mx-auto text-center">
          <p className="text-sm font-bold tracking-wide text-brand-600 sm:text-base">
            {data.preTitle}
          </p>
          <h2 className="mt-3 text-5xl font-black leading-tight tracking-tight text-brand-600 sm:text-6xl lg:text-7xl">
            {data.title}
          </h2>
          <p className="mt-6 text-base text-slate-700 sm:text-lg">
            {data.description.split("\n").map((line, i) => (
              <span key={i}>{i > 0 && <br className="hidden sm:inline" />}{line}</span>
            ))}
          </p>
        </Reveal>

        <RevealGroup
          stagger={0.12}
          className="mt-12 grid gap-5 sm:grid-cols-3 lg:gap-6"
        >
          {data.cards.map((card) => {
            const Icon = ICON_MAP[card.icon] ?? Phone;
            return (
              <RevealItem key={card.big} variant="up">
                <Card Icon={Icon} big={card.big} caption={card.caption} />
              </RevealItem>
            );
          })}
        </RevealGroup>

        <Reveal variant="up" delay={0.1}>
          <p className="mt-10 text-center text-base font-bold text-slate-900 sm:text-lg">
            {data.footer}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}

function Card({
  Icon,
  big,
  caption,
}: {
  Icon: React.ComponentType<{
    className?: string;
    strokeWidth?: number;
    "aria-hidden"?: boolean;
  }>;
  big: string;
  caption: string;
}) {
  return (
    <div className="rounded-2xl bg-white px-7 py-10 text-left shadow-lg sm:px-10 sm:py-12">
      <Icon
        aria-hidden
        className="size-10 text-brand-600 sm:size-12"
        strokeWidth={1.75}
      />
      <div className="mt-5 text-5xl font-black tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
        {big}
      </div>
      <div className="mt-3 text-sm font-semibold text-slate-600 sm:text-base lg:text-lg">
        {caption}
      </div>
    </div>
  );
}
