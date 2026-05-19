import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { siteConfig } from "@/lib/env";

export function Header() {
  const phone = siteConfig.phone;
  const phoneDisplay = phone
    ? phone.replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, "$1-$2-$3")
    : null;
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <Container className="flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-brand-700">
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-brand-600 text-white text-sm"
          >
            💧
          </span>
          <span className="tracking-tight">{siteConfig.name}</span>
        </Link>
        {phone && phoneDisplay && (
          <a
            href={`tel:${phone}`}
            className="inline-flex items-center gap-1.5 rounded-md bg-brand-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-brand-700"
            aria-label="전화 상담"
          >
            <span aria-hidden>📞</span>
            <span className="hidden sm:inline">{phoneDisplay}</span>
            <span className="sm:hidden">전화상담</span>
          </a>
        )}
      </Container>
    </header>
  );
}
