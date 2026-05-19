import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { ContactCTA } from "@/components/landing/CtaButtons";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = {
  title: "누수 시공 비용 가이드",
  description: "누수 탐지비·시공비 예시와 가격 책정 기준 안내. 추가 비용 없는 정찰제로 운영합니다.",
  alternates: { canonical: "/pricing-guide" },
  openGraph: {
    type: "website",
    title: `누수 시공 비용 가이드 | ${BUSINESS.name}`,
    description: "탐지비·시공비 예시 + 가격 책정 기준",
    url: `${BUSINESS.url}/pricing-guide`,
  },
};

const ITEMS: { title: string; range: string; desc: string }[] = [
  {
    title: "기본 누수 탐지비",
    range: "8만 ~ 15만 원",
    desc: "현장 방문·청음·열화상 진단 포함. 탐지 결과는 사진과 함께 안내드립니다.",
  },
  {
    title: "배관 부분 시공",
    range: "30만 ~ 80만 원",
    desc: "이음매 교체, 균열 부분 보수 등 비파괴 최소 시공. 자재·작업 시간에 따라 차이.",
  },
  {
    title: "줄눈·실리콘 보수",
    range: "20만 ~ 50만 원",
    desc: "욕실 줄눈 전체 재시공, 욕조·세면대 실리콘 작업. 면적 단위.",
  },
  {
    title: "옥상·외벽 방수",
    range: "면적별 견적",
    desc: "옥상 시트 방수, 외벽 크랙 우레탄 실링 + 발수 도장. 면적·접근성에 따라 책정.",
  },
];

export default function PricingGuidePage() {
  return (
    <>
      <Header />
      <main className="flex-1 pb-20">
        <section className="border-b border-slate-200 bg-slate-50 py-12 sm:py-16">
          <Container>
            <p className="text-sm font-semibold text-brand-700">비용 안내</p>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              누수 시공 비용 가이드
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              실제 시공 사례 기준 일반 가격대입니다. 현장 진단 후 사진과 함께 확정 견적을 드리며,{" "}
              <strong className="font-bold text-slate-900">확정 견적 외 추가 비용은 없습니다.</strong>
            </p>
          </Container>
        </section>

        <Container className="max-w-3xl py-12">
          <div className="grid gap-4 sm:grid-cols-2">
            {ITEMS.map((it) => (
              <div
                key={it.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h2 className="text-base font-extrabold text-slate-900">{it.title}</h2>
                <p className="mt-1 text-2xl font-black text-brand-700">{it.range}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{it.desc}</p>
              </div>
            ))}
          </div>

          <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <h2 className="text-lg font-extrabold text-slate-900">가격 책정 기준</h2>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-700">
              <li>· 현장 환경(노출 부위·접근성·층수)에 따라 시공 시간이 달라집니다.</li>
              <li>· 보험 처리는 손해보험사 출장 안내 후 진행 가능합니다.</li>
              <li>· {BUSINESS.warranty}: 시공 후 1년 이내 동일 부위 재누수 시 무상 처리.</li>
              <li>· 카드 결제·계좌이체·현금 모두 가능합니다.</li>
            </ul>
          </section>

          <div className="mt-12 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-6 text-white shadow-md sm:p-8">
            <h2 className="text-xl font-extrabold sm:text-2xl">정확한 견적이 궁금하세요?</h2>
            <p className="mt-2 text-sm text-white/90 sm:text-base">
              증상과 사진을 보내주시면 사진 견적을 먼저 드립니다.
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
