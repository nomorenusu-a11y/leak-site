import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { loadFaqItems } from "@/lib/seo/faq";
import { FaqAccordion } from "./FaqAccordion";

export async function FaqSection() {
  const faqItems = await loadFaqItems();

  return (
    <section id="faq" className="scroll-mt-20 bg-white py-8 md:py-12">
      <Container className="max-w-3xl">
        <Reveal variant="up" className="text-center">
          <p className="text-sm font-bold tracking-wide text-brand-600">FAQ</p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            자주 묻는 질문
          </h2>
          <p className="mt-3 text-slate-600">
            상담 전 미리 확인하시면 좋은 내용을 모았습니다.
          </p>
        </Reveal>

        <Reveal variant="up" delay={0.1} className="mt-10">
          <FaqAccordion items={faqItems} />
        </Reveal>

        <div className="mt-8 text-center">
          <Link
            href="/faq"
            className="inline-flex items-center gap-1 text-sm font-bold text-brand-700 hover:underline"
          >
            전체 자주 묻는 질문 보러가기 →
          </Link>
        </div>
      </Container>
    </section>
  );
}
