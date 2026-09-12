import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { loadFaqItems } from "@/lib/seo/faq";
import { FaqAccordion } from "./FaqAccordion";
import { Phone } from "@/components/icons";
import { BUSINESS } from "@/lib/business";

export async function FaqSection() {
  const faqItems = await loadFaqItems();
  const phone = BUSINESS.contact.phone;

  return (
    <section
      id="faq"
      className="scroll-mt-20 border-y border-slate-200 bg-gradient-to-b from-slate-50 via-white to-blue-50/50 py-16 md:py-24"
    >
      <Container className="max-w-5xl">
        <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14">
          <Reveal variant="up" className="text-center lg:pt-3 lg:text-left">
            <p className="section-kicker justify-center lg:justify-start">FAQ</p>
            <h2 className="mt-5 text-4xl font-black leading-[1.1] tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-[3.25rem]">
              궁금한 점,
              <br />
              <span className="text-brand-600">먼저 확인하세요.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-md text-base leading-7 text-slate-600 lg:mx-0 lg:max-w-sm">
              누수는 증상만으로 원인을 단정하기 어렵습니다.
              <br className="hidden sm:block" /> 상담 전에 많이 묻는 내용을 먼저 확인해 보세요.
            </p>

            <div className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row sm:justify-center lg:mx-0 lg:flex-col lg:items-start">
              {phone && (
                <a
                  href={`tel:${phone.tel}`}
                  className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#061b35] px-6 py-3.5 text-base font-black text-white shadow-lg shadow-slate-950/10 transition hover:bg-brand-900 sm:min-w-64"
                >
                  <Phone aria-hidden className="size-5" strokeWidth={2.5} />
                  {phone.display}
                  <span className="text-sm font-bold text-cyan-300">전화 상담</span>
                </a>
              )}
              <Link
                href="/faq"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-brand-200 bg-white px-6 py-3 text-sm font-extrabold text-brand-700 shadow-sm transition hover:border-brand-300 hover:bg-brand-50 sm:min-w-64"
              >
                전체 질문과 답변 보기
                <span aria-hidden className="ml-2 text-lg">→</span>
              </Link>
            </div>
          </Reveal>

          <div>
            <FaqAccordion items={faqItems} />
          </div>
        </div>
      </Container>
    </section>
  );
}
