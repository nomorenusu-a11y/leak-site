import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { ContactCTA } from "@/components/landing/CtaButtons";
import { FAQ_ITEMS, faqPageJsonLd } from "@/lib/seo/faq";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = {
  title: "자주 묻는 질문",
  description: `${BUSINESS.name} 누수 탐지·시공 관련 자주 묻는 질문 모음. 비용·지역·보증 안내.`,
  alternates: { canonical: "/faq" },
  openGraph: {
    type: "website",
    title: `자주 묻는 질문 | ${BUSINESS.name}`,
    description: "누수 탐지·시공 관련 자주 묻는 질문 모음",
    url: `${BUSINESS.url}/faq`,
  },
};

export default function FaqPage() {
  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd()) }}
      />
      <Header showBack />
      <main className="flex-1 pb-20">
        <section className="border-b border-slate-200 bg-slate-50 py-12 sm:py-16">
          <Container>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              자주 묻는 질문
            </h1>
            <p className="mt-2 max-w-2xl text-slate-600">
              상담 전 미리 확인하시면 좋은 내용을 모았습니다. 더 궁금한 점은 전화·카톡으로 문의 주세요.
            </p>
          </Container>
        </section>
        <Container className="max-w-3xl py-12">
          <ul className="space-y-6">
            {FAQ_ITEMS.map((item, i) => (
              <li
                key={item.question}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
              >
                <h2 className="text-lg font-extrabold text-slate-900 sm:text-xl">
                  Q{i + 1}. {item.question}
                </h2>
                <p className="mt-2 leading-relaxed text-slate-700">{item.answer}</p>
              </li>
            ))}
          </ul>

          <div className="mt-12 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-6 text-white shadow-md sm:p-8">
            <h2 className="text-xl font-extrabold sm:text-2xl">더 궁금한 점이 있으세요?</h2>
            <p className="mt-2 text-sm text-white/90 sm:text-base">
              상황을 알려주시면 빠르게 답변드릴게요.
            </p>
            <div className="mt-5">
              <ContactCTA layout="row" />
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
