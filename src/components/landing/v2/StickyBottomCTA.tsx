"use client";

import { useState } from "react";
import Link from "next/link";
import { Phone, Sparkles } from "@/components/icons";
import { getContactInfo } from "@/lib/contact";
import { BUSINESS } from "@/lib/business";
import { EVENTS, trackEvent } from "@/lib/analytics";

const PHONE_PREFILL_KEY = "quote.phone.prefill";

/**
 * 데스크탑 하단 고정 CTA 바 (md+).
 *
 * 좌측: 로고 영역 + 전화번호 강조
 * 가운데: 전화번호 입력 input (10~11자리 자동 포맷)
 * 우측: "상담 신청" 큰 버튼 + 개인정보 동의 한 줄
 *
 * 제출 시: 입력한 번호를 sessionStorage에 prefill 키로 저장하고 #quote-form으로 스크롤.
 * 메인 견적 폼이 mount 시 그 값을 읽어 phone 필드에 자동 입력.
 *
 * 모바일은 기존 MobileBottomBar가 담당 — 여기는 md 이상만 렌더.
 */
export function StickyBottomCTA() {
  const { phone } = getContactInfo();
  const [phoneInput, setPhoneInput] = useState("");
  const [agreed, setAgreed] = useState(true);

  function formatPhone(raw: string): string {
    const d = raw.replace(/\D/g, "").slice(0, 11);
    if (d.length < 4) return d;
    if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
    if (d.length === 10)
      return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
    return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!agreed) return;
    if (phoneInput.replace(/\D/g, "").length >= 9) {
      try {
        sessionStorage.setItem(PHONE_PREFILL_KEY, phoneInput);
      } catch {
        // sessionStorage 차단 환경에서도 스크롤은 진행
      }
    }
    trackEvent(EVENTS.CTA_CLICK, { cta_label: "sticky_cta_submit" });
    const target = document.getElementById("quote-form");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.hash = "#quote-form";
    }
  }

  return (
    <div
      role="region"
      aria-label="빠른 상담 신청"
      className="fixed inset-x-0 bottom-0 z-40 hidden border-t border-brand-800 bg-brand-900/95 text-white shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.4)] backdrop-blur md:block"
    >
      <div className="mx-auto flex max-w-[76rem] items-center gap-4 px-4 py-3">
        {/* 좌측 — 안내 + 전화번호 */}
        <div className="flex shrink-0 items-center gap-3">
          <span
            aria-hidden
            className="inline-flex size-10 items-center justify-center rounded-full bg-highlight-400 text-brand-900 shadow-lg shadow-highlight-500/30"
          >
            <Phone className="size-5" strokeWidth={2.5} aria-hidden />
          </span>
          <div className="leading-tight">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/70">
              긴급출동 요청
            </p>
            {phone ? (
              <a
                href={`tel:${phone.tel}`}
                onClick={() =>
                  trackEvent(EVENTS.CLICK_CALL, {
                    cta_label: "sticky_cta_phone",
                  })
                }
                className="text-xl font-black tracking-tight text-highlight-300 hover:underline"
              >
                {phone.display}
              </a>
            ) : (
              <span className="text-xl font-black tracking-tight text-highlight-300">
                010-7543-7711
              </span>
            )}
          </div>
        </div>

        {/* 가운데 — 폼 */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-1 items-center gap-2"
          aria-label="빠른 상담 신청"
        >
          <label htmlFor="sticky-cta-phone" className="sr-only">
            연락처
          </label>
          <input
            id="sticky-cta-phone"
            type="tel"
            inputMode="numeric"
            value={phoneInput}
            onChange={(e) => setPhoneInput(formatPhone(e.target.value))}
            placeholder="연락처 입력 (예: 010-1234-5678)"
            className="h-11 flex-1 rounded-lg border border-white/30 bg-white/95 px-4 text-sm font-bold text-slate-900 placeholder:text-slate-400 focus:border-highlight-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!agreed}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-lg bg-highlight-400 px-5 text-sm font-extrabold text-brand-900 shadow-md shadow-highlight-500/30 transition hover:bg-highlight-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Sparkles aria-hidden className="size-4" strokeWidth={2.5} />
            상담 신청
          </button>
        </form>

        {/* 우측 — 개인정보 동의 */}
        <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-[11px] font-semibold text-white/80">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="size-3.5 rounded border-white/40 accent-highlight-400"
          />
          <Link
            href="/privacy"
            target="_blank"
            className="underline-offset-2 hover:underline"
          >
            개인정보처리방침
          </Link>
          <span>동의</span>
        </label>
      </div>
    </div>
  );
}

export { PHONE_PREFILL_KEY };
