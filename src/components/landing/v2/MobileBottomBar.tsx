"use client";

import Link from "next/link";
import { Phone, MessageCircle, Sparkles } from "@/components/icons";
import { getContactInfo } from "@/lib/contact";
import { EVENTS, trackEvent } from "@/lib/analytics";

/**
 * 모바일 하단 고정 메뉴 (장인케어 톤).
 *
 * 3개 아이콘:
 *   - 견적문의 (#quote-form 스크롤)
 *   - 상담하기 (전화) — 중앙, 크게
 *   - 작업사례 (/posts)
 *
 * 카톡 URL이 있으면 견적문의 대신 카톡 노출.
 * 전화 없으면 상담 자리에 견적 fallback.
 */
export function MobileBottomBar() {
  const { phone, kakao } = getContactInfo();

  return (
    <div
      role="region"
      aria-label="빠른 상담"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="relative grid h-[68px] grid-cols-3 items-center text-center">
        {/* 좌측: 견적 / 카톡 */}
        {kakao ? (
          <a
            href={kakao.url}
            target="_blank"
            rel="noopener"
            onClick={() => trackEvent(EVENTS.CLICK_KAKAO, { cta_label: "mobile_bar_kakao" })}
            className="flex h-full flex-col items-center justify-center gap-0.5 text-[#3C1E1E]"
            aria-label="카카오톡 상담"
          >
            <MessageCircle aria-hidden className="size-6" strokeWidth={2} />
            <span className="text-[11px] font-bold">카톡상담</span>
          </a>
        ) : (
          <Link
            href="#quote-form"
            onClick={() => trackEvent(EVENTS.CTA_CLICK, { cta_label: "mobile_bar_quote" })}
            className="flex h-full flex-col items-center justify-center gap-0.5 text-slate-800"
            aria-label="견적 문의"
          >
            <Sparkles aria-hidden className="size-6" strokeWidth={2} />
            <span className="text-[11px] font-bold">견적문의</span>
          </Link>
        )}

        {/* 중앙: 큰 전화 — flex-col + 명시적 pb로 텍스트 안 가림 */}
        {phone ? (
          <a
            href={`tel:${phone.tel}`}
            onClick={() => trackEvent(EVENTS.CLICK_CALL, { cta_label: "mobile_bar_call" })}
            aria-label={`전화 ${phone.display}로 상담`}
            className="relative flex h-full flex-col items-center justify-end pb-1.5"
          >
            <span
              aria-hidden
              className="absolute left-1/2 -top-7 flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-accent-500 text-white shadow-lg shadow-accent-500/40 ring-4 ring-white"
            >
              <Phone className="size-6" strokeWidth={2.25} aria-hidden />
            </span>
            <span className="text-[11px] font-extrabold text-accent-600">상담하기</span>
          </a>
        ) : (
          <Link
            href="#quote-form"
            className="relative flex h-full flex-col items-center justify-end pb-1.5"
            aria-label="무료 견적 신청"
          >
            <span
              aria-hidden
              className="absolute left-1/2 -top-7 flex size-14 -translate-x-1/2 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg shadow-brand-600/40 ring-4 ring-white"
            >
              <Sparkles className="size-6" strokeWidth={2.25} aria-hidden />
            </span>
            <span className="text-[11px] font-extrabold text-brand-700">견적신청</span>
          </Link>
        )}

        {/* 우측: 작업사례 */}
        <Link
          href="/posts"
          className="flex h-full flex-col items-center justify-center gap-0.5 text-slate-800"
          aria-label="작업사례 보기"
        >
          <ThumbsUpIcon className="size-6" />
          <span className="text-[11px] font-bold">작업사례</span>
        </Link>
      </div>
    </div>
  );
}

function ThumbsUpIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M7 22V11" />
      <path d="M14 2l-2 9h7a2 2 0 0 1 2 2.4l-1.5 7A2 2 0 0 1 17.6 22H7" />
      <path d="M3 11h4v11H3z" />
    </svg>
  );
}
