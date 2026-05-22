"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X, Phone, MessageCircle, FileText, ChevronRight } from "@/components/icons";
import { getContactInfo } from "@/lib/contact";
import { EVENTS, trackEvent } from "@/lib/analytics";

type NavItem = { href: string; label: string };

const NAV: NavItem[] = [
  { href: "/", label: "홈" },
  { href: "/posts", label: "시공 사례" },
  { href: "/pricing-guide", label: "가격 안내" },
  { href: "/faq", label: "자주 묻는 질문" },
  { href: "/#quote-form", label: "무료 견적 신청" },
];

/**
 * 모바일 햄버거 메뉴 (Drawer).
 * Header의 좌측 햄버거 버튼이 토글. body scroll lock + ESC 닫기.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const { phone, kakao } = getContactInfo();

  // body scroll lock + ESC 닫기
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label="메뉴 열기"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="inline-flex size-10 items-center justify-center rounded-lg text-slate-800 hover:bg-slate-100 md:hidden"
      >
        <Menu aria-hidden className="size-6" strokeWidth={2.25} />
      </button>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            aria-hidden
          />
          {/* Panel */}
          <aside className="absolute left-0 top-0 flex h-full w-[82%] max-w-sm flex-col bg-white shadow-2xl animate-[slideInLeft_.25s_ease-out]">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <span className="text-base font-extrabold text-slate-900">메뉴</span>
              <button
                type="button"
                aria-label="메뉴 닫기"
                onClick={() => setOpen(false)}
                className="inline-flex size-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100"
              >
                <X aria-hidden className="size-5" strokeWidth={2.25} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-2 py-3" aria-label="모바일 메인 메뉴">
              <ul className="flex flex-col">
                {NAV.map((it) => (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-xl px-3 py-3.5 text-base font-bold text-slate-800 hover:bg-slate-50"
                    >
                      <span>{it.label}</span>
                      <ChevronRight aria-hidden className="size-5 text-slate-400" strokeWidth={2} />
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* 하단 CTA */}
            <div className="space-y-2 border-t border-slate-200 p-4">
              {phone && (
                <a
                  href={`tel:${phone.tel}`}
                  onClick={() => {
                    trackEvent(EVENTS.CLICK_CALL, { cta_label: "drawer_call" });
                    setOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-3.5 text-base font-extrabold text-white shadow-md shadow-accent-500/30"
                >
                  <Phone aria-hidden className="size-5" strokeWidth={2.25} />
                  <span>{phone.display}</span>
                </a>
              )}
              {kakao ? (
                <a
                  href={kakao.url}
                  target="_blank"
                  rel="noopener"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#FEE500] px-4 py-3.5 text-base font-extrabold text-[#191600]"
                >
                  <MessageCircle aria-hidden className="size-5" strokeWidth={2.25} />
                  <span>카카오톡 상담</span>
                </a>
              ) : (
                <Link
                  href="/#quote-form"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3.5 text-base font-extrabold text-white"
                >
                  <FileText aria-hidden className="size-5" strokeWidth={2.25} />
                  <span>무료 견적 받기</span>
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
