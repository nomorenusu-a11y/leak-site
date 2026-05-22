import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = {
  title: "이용약관",
  description: `${BUSINESS.name} 서비스 이용약관`,
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

export default function TermsPage() {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <>
      <Header showBack />
      <main className="flex-1 pb-20">
        <Container className="max-w-3xl py-12 sm:py-16">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            이용약관
          </h1>
          <p className="mt-2 text-sm text-slate-500">시행일: {today}</p>

          <div className="prose prose-slate max-w-none mt-8 prose-headings:font-extrabold prose-headings:text-slate-900 prose-a:text-brand-700">
            <h2>제1조 (목적)</h2>
            <p>
              본 약관은 {BUSINESS.name}(이하 “회사”)이 제공하는 누수 탐지·시공
              상담 서비스 및 이를 안내하는 웹사이트(이하 “서비스”)의 이용 조건과
              절차를 정합니다.
            </p>

            <h2>제2조 (정의)</h2>
            <ul>
              <li>“이용자”란 서비스에 접근해 견적을 신청하거나 정보를 조회하는 자를 말합니다.</li>
              <li>“견적 신청”이란 본 웹사이트의 견적 폼을 통해 회사에 상담을 요청하는 행위를 말합니다.</li>
            </ul>

            <h2>제3조 (견적·시공)</h2>
            <ol>
              <li>모든 견적은 현장 진단 후 사진과 함께 확정합니다.</li>
              <li>확정된 견적 외 추가 비용은 이용자 동의 없이 청구하지 않습니다.</li>
              <li>시공 후 1년 이내 동일 부위 재누수가 발생하면 무상으로 재시공합니다.
              단, 외부 충격·사용자 과실·자연재해 등으로 인한 손상은 제외합니다.</li>
            </ol>

            <h2>제4조 (책임 제한)</h2>
            <p>
              회사는 천재지변, 통신 장애, 회사 외 제3자의 행위로 발생한 불가항력적 사유로
              인한 서비스 중단·지연에 대해 책임지지 않습니다.
            </p>

            <h2>제5조 (개인정보 보호)</h2>
            <p>
              회사는 이용자의 개인정보를 보호하기 위해{" "}
              <a href="/privacy">개인정보처리방침</a>을 별도로 마련해 운영합니다.
            </p>

            <h2>제6조 (분쟁 해결)</h2>
            <p>본 약관과 관련된 분쟁은 대한민국 법령에 따라 처리됩니다.</p>

            <p className="text-xs text-slate-500 mt-8">
              본 약관은 변경 시 본 페이지에 게시하여 안내합니다.
            </p>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
