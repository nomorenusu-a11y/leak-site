import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { BUSINESS } from "@/lib/business";

/**
 * 푸터. 사업자 정보는 BUSINESS에서 가져오며, 빈 값이면 해당 줄 자체를 미렌더.
 * "추후 입력" 같은 placeholder 텍스트 절대 노출하지 않음.
 */
export function Footer() {
  const lines: { label: string; value: string }[] = [];
  if (BUSINESS.legalName) lines.push({ label: "법인명", value: BUSINESS.legalName });
  if (BUSINESS.ownerName) lines.push({ label: "대표", value: BUSINESS.ownerName });
  if (BUSINESS.businessRegNo)
    lines.push({ label: "사업자등록번호", value: BUSINESS.businessRegNo });
  if (BUSINESS.address) lines.push({ label: "주소", value: BUSINESS.address });
  if (BUSINESS.bizType) lines.push({ label: "업태", value: BUSINESS.bizType });
  if (BUSINESS.bizCategory)
    lines.push({ label: "종목", value: BUSINESS.bizCategory });
  if (BUSINESS.email) lines.push({ label: "이메일", value: BUSINESS.email });

  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <Container className="py-10">
        <p className="mb-6 rounded-lg bg-slate-800/60 px-4 py-2 text-xs text-slate-400">
          * 게시된 출동 시간·시공 결과는 작업환경과 상황에 따라 달라질 수 있습니다.
        </p>
        <div className="grid gap-6 sm:grid-cols-3">
          {/* 1. 브랜드 + 짧은 한 줄 */}
          <div>
            <Logo size="sm" textClass="text-white" />
            <p className="mt-3 text-sm text-slate-400">
              누수 탐지·시공 · {BUSINESS.serviceArea} · 24시간 상담
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {BUSINESS.warranty} · {BUSINESS.pricing}
            </p>
          </div>

          {/* 2. 메뉴 */}
          <nav aria-label="푸터 메뉴" className="text-sm">
            <p className="mb-2 font-semibold text-slate-200">메뉴</p>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link href="/" className="hover:text-white">홈</Link></li>
              <li><Link href="/posts" className="hover:text-white">시공 사례</Link></li>
              <li><Link href="/#quote-form" className="hover:text-white">견적 신청</Link></li>
              <li><Link href="/privacy" className="hover:text-white">개인정보처리방침</Link></li>
              <li><Link href="/terms" className="hover:text-white">이용약관</Link></li>
            </ul>
          </nav>

          {/* 3. 사업자 정보 */}
          <div className="text-sm text-slate-400">
            <p className="mb-2 font-semibold text-slate-200">사업자 정보</p>
            {lines.length === 0 ? (
              <p className="text-xs text-slate-500">사업자 정보는 운영 시작 후 등록됩니다.</p>
            ) : (
              <dl className="space-y-1">
                {lines.map((l) => (
                  <div key={l.label} className="flex gap-2">
                    <dt className="shrink-0 text-slate-500">{l.label}</dt>
                    <dd className="text-slate-300">{l.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        </div>
        <p className="mt-8 border-t border-slate-800 pt-5 text-xs text-slate-500">
          © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
