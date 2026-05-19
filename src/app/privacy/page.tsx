import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { BUSINESS } from "@/lib/business";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: `${BUSINESS.name}의 개인정보 수집·이용에 관한 안내`,
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

export default function PrivacyPage() {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <>
      <Header />
      <main className="flex-1 pb-20">
        <Container className="max-w-3xl py-12 sm:py-16">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            개인정보처리방침
          </h1>
          <p className="mt-2 text-sm text-slate-500">시행일: {today}</p>

          <div className="prose prose-slate max-w-none mt-8 prose-headings:font-extrabold prose-headings:text-slate-900 prose-a:text-brand-700">
            <p>
              {BUSINESS.name}(이하 “회사”)는 견적 문의 처리에 필요한 최소한의 개인정보를
              수집·이용하며, 「개인정보 보호법」 등 관련 법령을 준수합니다.
            </p>

            <h2>1. 수집하는 개인정보 항목</h2>
            <ul>
              <li>필수: 이름, 휴대전화 번호, 누수 증상</li>
              <li>선택: 거주 지역, 아파트명, 현장 사진</li>
              <li>자동 수집: UTM 파라미터(광고 매체 식별용)</li>
            </ul>

            <h2>2. 수집·이용 목적</h2>
            <ul>
              <li>견적 안내 및 시공 상담</li>
              <li>약속 조정·일정 안내·시공 진행 확인</li>
              <li>서비스 품질 개선 및 통계 분석</li>
            </ul>

            <h2>3. 보유 및 이용 기간</h2>
            <p>
              수집된 개인정보는 견적·시공이 완료된 시점으로부터 <strong>1년간 보관</strong>한
              뒤 안전하게 파기합니다. 회계·세무 관련 법령상 별도 보관 의무가 있는 항목은
              해당 법령이 정한 기간 동안 보관할 수 있습니다.
            </p>

            <h2>4. 제3자 제공</h2>
            <p>회사는 이용자의 개인정보를 제3자에게 제공하지 않습니다. 단, 법령에 따라
            요구되는 경우 관계 기관에 한해 제공할 수 있습니다.</p>

            <h2>5. 이용자의 권리</h2>
            <p>이용자는 언제든지 본인의 개인정보 열람·정정·삭제 및 처리 정지를 요청할 수
            있습니다. 요청은 아래 문의처로 보내주세요.</p>

            <h2>6. 안전성 확보 조치</h2>
            <ul>
              <li>전송 구간 암호화(HTTPS)</li>
              <li>관리자 접근 제어 (단일 비밀번호 + HMAC 서명 쿠키)</li>
              <li>비공개 운영 영역(`/admin`)에는 검색엔진 색인 차단</li>
            </ul>

            <h2>7. 문의처</h2>
            {BUSINESS.email || BUSINESS.contact.phone || BUSINESS.ownerName ? (
              <ul>
                {BUSINESS.ownerName && <li>책임자: {BUSINESS.ownerName}</li>}
                {BUSINESS.email && (
                  <li>
                    이메일: <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
                  </li>
                )}
                {BUSINESS.contact.phone && (
                  <li>
                    전화:{" "}
                    <a href={`tel:${BUSINESS.contact.phone.tel}`}>
                      {BUSINESS.contact.phone.display}
                    </a>
                  </li>
                )}
              </ul>
            ) : (
              <p>문의처는 운영 시작 후 업데이트 됩니다.</p>
            )}

            <p className="text-xs text-slate-500 mt-8">
              본 방침은 변경 시 본 페이지에 게시하여 안내합니다.
            </p>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
