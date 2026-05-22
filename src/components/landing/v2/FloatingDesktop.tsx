"use client";

import { useCallback, useEffect, useState } from "react";
import { Phone, MessageCircle, MessageSquare, ArrowUp } from "@/components/icons";
import { getContactInfo } from "@/lib/contact";
import { EVENTS, trackEvent } from "@/lib/analytics";

/**
 * 데스크탑 우측 고정 플로팅 (장인케어 IMG_1 톤).
 *
 * 전화 / 카톡(또는 SMS) / TOP. 카톡 미설정이면 SMS 링크로 fallback.
 * 모바일에서는 하단 바가 이미 있으므로 숨김.
 */
export function FloatingDesktop() {
  const { phone, kakao } = getContactInfo();
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div
      aria-label="빠른 연락"
      className="pointer-events-none fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-2 md:flex"
    >
      {phone && (
        <a
          href={`tel:${phone.tel}`}
          onClick={() => trackEvent(EVENTS.CLICK_CALL, { cta_label: "floating_call" })}
          aria-label={`전화 ${phone.display}로 상담`}
          className="pointer-events-auto group flex w-16 flex-col items-center gap-1 rounded-2xl bg-brand-600 px-2 py-3 text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700"
        >
          <Phone aria-hidden className="size-6" strokeWidth={2.25} />
          <span className="text-[10px] font-extrabold">전화상담</span>
        </a>
      )}
      {kakao ? (
        <a
          href={kakao.url}
          target="_blank"
          rel="noopener"
          onClick={() => trackEvent(EVENTS.CLICK_KAKAO, { cta_label: "floating_kakao" })}
          aria-label="카카오톡 상담"
          className="pointer-events-auto flex w-16 flex-col items-center gap-1 rounded-2xl bg-[#FEE500] px-2 py-3 text-[#3C1E1E] shadow-lg hover:brightness-95"
        >
          <MessageCircle aria-hidden className="size-6" strokeWidth={2.25} />
          <span className="text-[10px] font-extrabold">카톡상담</span>
        </a>
      ) : phone ? (
        <a
          href={`sms:${phone.tel}`}
          aria-label={`문자 ${phone.display}로 상담`}
          className="pointer-events-auto flex w-16 flex-col items-center gap-1 rounded-2xl bg-emerald-500 px-2 py-3 text-white shadow-lg shadow-emerald-500/30 hover:bg-emerald-600"
        >
          <MessageSquare aria-hidden className="size-6" strokeWidth={2.25} />
          <span className="text-[10px] font-extrabold">문자상담</span>
        </a>
      ) : null}
      <button
        type="button"
        onClick={toTop}
        aria-label="맨 위로"
        className={`pointer-events-auto flex w-16 flex-col items-center gap-1 rounded-2xl bg-slate-800 px-2 py-3 text-white shadow-lg hover:bg-slate-900 ${
          showTop ? "opacity-100" : "pointer-events-none opacity-0"
        } transition-opacity`}
      >
        <ArrowUp aria-hidden className="size-6" strokeWidth={2.25} />
        <span className="text-[10px] font-extrabold">TOP</span>
      </button>
    </div>
  );
}
