import { Container } from "@/components/ui/Container";
import { BUSINESS } from "@/lib/business";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <Container className="py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-base font-bold text-white">{BUSINESS.name}</p>
            <p className="mt-1 text-sm text-slate-400">
              누수 탐지·시공 · {BUSINESS.serviceArea} · 24시간 상담
            </p>
          </div>
          <div className="text-sm leading-relaxed text-slate-400">
            <p>{BUSINESS.warranty} · {BUSINESS.pricing}</p>
            <p>사업자 정보: 추후 입력</p>
          </div>
        </div>
        <p className="mt-8 text-xs text-slate-500">
          © {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
