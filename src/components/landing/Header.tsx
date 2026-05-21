import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Logo } from "@/components/ui/Logo";
import { Phone } from "@/components/icons";
import { normalizePhone } from "@/lib/contact";
import { siteConfig } from "@/lib/env";

const NAV: { href: string; label: string }[] = [
  { href: "/posts", label: "시공 사례" },
  { href: "/faq", label: "자주 묻는 질문" },
];

export function Header() {
  const phone = normalizePhone(siteConfig.phone);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <Container className="flex h-16 items-center justify-between gap-3">
        <Logo size="md" hideTextOnMobile />
        <nav aria-label="주요 메뉴" className="flex items-center gap-1">
          <ul className="hidden items-center gap-1 md:flex">
            {NAV.map((it) => (
              <li key={it.href}>
                <Link
                  href={it.href}
                  className="rounded-md px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 hover:text-brand-700"
                >
                  {it.label}
                </Link>
              </li>
            ))}
          </ul>
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
