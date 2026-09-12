import { Phone } from "@/components/icons";
import { Container } from "@/components/ui/Container";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { BUSINESS } from "@/lib/business";

const CONSULTATION_STEPS = [
  {
    eyebrow: "01 CONSULT",
    title: "증상 먼저 확인",
    description: "사진과 증상을 바탕으로 점검 방향을 안내합니다.",
    position: "left center",
  },
  {
    eyebrow: "02 INSPECTION",
    title: "현장 점검과 설명",
    description: "확인할 범위와 진행 순서를 이해하기 쉽게 설명합니다.",
    position: "center center",
  },
  {
    eyebrow: "03 FOLLOW-UP",
    title: "작업 뒤에도 안내",
    description: "작업 내용과 이후 확인할 사항을 안내합니다.",
    position: "right center",
  },
] as const;

export function MasterSection() {
  const phone = BUSINESS.contact.phone;

  return (
    <section className="border-y border-slate-100 bg-slate-50 py-12 md:py-16">
      <Container>
        <Reveal variant="up" className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold tracking-wide text-brand-600">WHY NO MORE NUSU</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            누수 상담은 <span className="text-brand-600">이렇게</span>
            <br />
            진행합니다.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            상담부터 현장 점검, 작업 안내까지 필요한 내용을 먼저 설명드립니다.
          </p>
        </Reveal>

        <RevealGroup stagger={0.1} className="mt-8 grid gap-4 md:grid-cols-3">
          {CONSULTATION_STEPS.map((step) => (
            <RevealItem key={step.eyebrow} variant="up">
              <article className="h-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
                <div
                  className="h-48 bg-no-repeat sm:h-52"
                  role="img"
                  aria-label={step.title}
                  style={{
                    backgroundImage: "url('/about/consultation-flow.jpg')",
                    backgroundPosition: step.position,
                    backgroundSize: "300% auto",
                  }}
                />
                <div className="p-5">
                  <p className="text-xs font-extrabold tracking-[0.12em] text-brand-600">
                    {step.eyebrow}
                  </p>
                  <h3 className="mt-2 text-xl font-extrabold tracking-tight text-slate-950">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {step.description}
                  </p>
                </div>
              </article>
            </RevealItem>
          ))}
        </RevealGroup>

        {phone && (
          <Reveal variant="up" delay={0.2} className="mt-8 text-center">
            <a
              href={`tel:${phone.tel}`}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800"
              aria-label={`전화 ${phone.display}로 상담`}
            >
              <Phone aria-hidden className="size-4" strokeWidth={2.5} />
              전화 상담 {phone.display}
            </a>
          </Reveal>
        )}
      </Container>
    </section>
  );
}
