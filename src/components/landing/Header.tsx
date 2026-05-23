import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { Phone, ArrowLeft } from "@/components/icons";
import { normalizePhone } from "@/lib/contact";
import { siteConfig } from "@/lib/env";
import { MobileMenu } from "./MobileMenu";

const NAV: { href: string; label: string }[] = [
  { href: "/#about", label: "회사소개" },
  { href: "/#services", label: "서비스" },
  { href: "/posts", label: "작업사례" },
  { href: "/#equipment", label: "최신장비" },
  { href: "/#reviews", label: "고객후기" },
  { href: "/faq", label: "자주 묻는 질문" },
];

type Props = {
  showBack?: boolean;
};

/**
 * 사이트 헤더 — 상단 무료상담 띠 + 메인 헤더 2단 구성.
 *
 * 띠: [무료상담] 365일 24시간 상담 가능 · {phone}
 * 메인: [로고+슬로건] [메뉴 6개]   [전화 yellow CTA]
 */
export function Header({ showBack = false }: Props) {
  const phone = normalizePhone(siteConfig.phone);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
      {/* 상단 무료상담 띠 (PC만) */}
      {phone && (
        <div className="hidden bg-brand-700 text-white md:block">
          <Container className="flex h-9 items-center justify-center gap-3 text-xs font-bold">
            <span className="inline-flex items-center gap-1 rounded-full bg-highlight-400 px-2 py-0.5 text-[11px] font-extrabold text-brand-900">
              무료상담
            </span>
            <span className="text-white/90">365일 24시간 상담 가능</span>
            <span aria-hidden className="text-white/40">·</span>
            <a
              href={`tel:${phone.tel}`}
              className="font-extrabold text-highlight-300 hover:underline"
            >
              {phone.display}
            </a>
          </Container>
        </div>
      )}

      {/* 메인 헤더 */}
      <Container className="flex h-16 items-center justify-between gap-3">
        {/* 좌측: 로고 + 슬로건 + (서브페이지) 홈 링크 */}
        <div className="flex items-center gap-2">
          <Logo size="md" hideTextOnMobile />
          <span className="hidden text-xs font-semibold text-slate-500 lg:inline-block">
            신속함과 정직함으로 누수를 해결합니다
          </span>
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
          <ul className="hidden items-center gap-0.5 lg:flex">
            {NAV.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className="rounded-md px-2.5 py-1.5 text-sm font-bold text-slate-700 hover:bg-slate-100 hover:text-brand-700"
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
          <MobileMenu />
          {phone && (
            <a
              href={`tel:${phone.tel}`}
              className="ml-1 inline-flex size-10 items-center justify-center rounded-full bg-highlight-400 text-brand-900 shadow-sm hover:bg-highlight-300"
              aria-label={`전화 ${phone.display}로 상담`}
            >
              <Phone aria-hidden className="size-5" strokeWidth={2.5} />
            </a>
          )}
        </nav>
      </Container>
    </header>
  );
}
