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
    <section id="faq" className="scroll-mt-20 border-y border-slate-100 bg-slate-50 py-12 md:py-16">
      <Container className="max-w-5xl">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <Reveal variant="up" className="lg:pt-3">
            <p className="text-sm font-bold tracking-wide text-brand-600">FAQ</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
              궁금한 점,
              <br />
              먼저 확인하세요.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-600 sm:text-base">
              누수는 증상만으로 원인을 단정하기 어렵습니다. 상담 전에 많이 묻는 내용을 정리했습니다.
            </p>

            {phone && (
              <a
                href={`tel:${phone.tel}`}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-extrabold text-white transition hover:bg-slate-800"
              >
                <Phone aria-hidden className="size-4" strokeWidth={2.5} />
                {phone.display} 전화 상담
              </a>
            )}
            <Link
              href="/faq"
              className="mt-4 block text-sm font-bold text-brand-700 hover:underline"
            >
              전체 질문과 답변 보기 →
            </Link>
          </Reveal>

          <Reveal variant="up" delay={0.1}>
            <FaqAccordion items={faqItems} />
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
