import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { Phone, ArrowLeft } from "@/components/icons";
import { normalizePhone } from "@/lib/contact";
import { siteConfig } from "@/lib/env";
import { MobileMenu } from "./MobileMenu";

const NAV: { href: string; label: string }[] = [
  { href: "/posts", label: "시공 사례" },
  { href: "/pricing-guide", label: "가격 안내" },
  { href: "/faq", label: "자주 묻는 질문" },
];

type Props = {
  /**
   * true면 좌측에 "← 홈" 화살표 노출. 메인 페이지에선 false (로고가 홈 역할).
   * 서브 페이지(/posts, /faq, /privacy 등)에서 사용.
   */
  showBack?: boolean;
};

/**
 * 사이트 헤더 — 솔리드 흰색 (스크롤 시 backdrop blur 안 함, 로고 회색 변색 방지).
 *
 * 모바일 레이아웃: [햄버거] [로고]    [전화]
 * 데스크탑 레이아웃: [로고] [메뉴]   [전화]
 *
 * showBack=true: 데스크탑에서 "← 홈" 작은 링크. 모바일은 햄버거의 "홈" 항목으로 충분.
 */
export function Header({ showBack = false }: Props) {
  const phone = normalizePhone(siteConfig.phone);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      <Container className="flex h-16 items-center justify-between gap-3">
        {/* 좌측: 로고 + (서브페이지일 때) 홈 링크 */}
        <div className="flex items-center gap-1.5">
          <Logo size="md" hideTextOnMobile />
          {showBack && (
            <Link
              href="/"
              aria-label="메인으로"
              className="ml-1 hidden items-center gap-0.5 rounded-md px-2 py-1.5 text-sm font-bold text-brand-700 hover:bg-brand-50 sm:inline-flex"
            >
              <ArrowLeft aria-hidden className="size-4" strokeWidth={2.25} />
              <span>홈</span>
            </Link>
          )}
        </div>

        {/* 우측: 데스크탑 메뉴 + 모바일 햄버거 + 전화 */}
        <nav aria-label="주요 메뉴" className="flex items-center gap-1">
          <ul className="hidden items-center gap-1 md:flex">
            {NAV.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className="rounded-md px-3 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-100 hover:text-brand-700"
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
          {/* 모바일 햄버거 — 전화상담 버튼 바로 왼쪽 */}
          <MobileMenu />
          {phone && (
            <a
              href={`tel:${phone.tel}`}
              className="ml-1 inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-brand-700"
              aria-label={`전화 ${phone.display}로 상담`}
            >
              <Phone aria-hidden className="size-4" strokeWidth={2.25} />
              <span className="hidden sm:inline">{phone.display}</span>
              <span className="sm:hidden">전화상담</span>
            </a>
          )}
        </nav>
      </Container>
    </header>
  );
}
