"use client";

import Link from "next/link";
import { Phone, MessageCircle, FileText } from "@/components/icons";
import { getContactInfo } from "@/lib/contact";
import { EVENTS, trackEvent } from "@/lib/analytics";

type Variant = "primary" | "ghost";

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-colors min-h-[48px] px-5 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

/**
 * 전화 CTA. phone 정규화 실패면 렌더 안 함.
 * 디자인 정책: 전화는 '긴급 액션'이라 accent(오렌지) 유지 — 사이트 내 유일한 accent 사용처.
 */
export function PhoneButton({
  block = false,
  label,
}: {
  block?: boolean;
  /** 지역 랜딩처럼 행동을 먼저 보여줘야 하는 화면용 문구 */
  label?: string;
}) {
  const { phone } = getContactInfo();
  if (!phone) return null;
  return (
    <a
      href={`tel:${phone.tel}`}
      onClick={() => trackEvent(EVENTS.CLICK_CALL, { cta_label: "phone" })}
      className={`${BTN_BASE} bg-accent-500 shadow-accent-500/30 hover:bg-accent-600 focus-visible:ring-accent-400 text-white shadow-md ${
        block ? "w-full" : ""
      }`}
      aria-label={`전화 ${phone.display}로 상담`}
    >
      <Phone aria-hidden className="size-5" strokeWidth={2.25} />
      <span>{label ?? phone.display}</span>
    </a>
  );
}

/**
 * 카톡 CTA. kakao 미설정이면 렌더 안 함.
 */
export function KakaoButton({ block = false }: { block?: boolean }) {
  const { kakao } = getContactInfo();
  if (!kakao) return null;
  return (
    <a
      href={kakao.url}
      target="_blank"
      rel="noopener"
      onClick={() => trackEvent(EVENTS.CLICK_KAKAO, { cta_label: "kakao" })}
      className={`${BTN_BASE} bg-[#FEE500] text-[#191600] hover:brightness-95 focus-visible:ring-yellow-300 ${
        block ? "w-full" : ""
      }`}
      aria-label="카카오톡 채널로 상담"
    >
      <MessageCircle aria-hidden className="size-5" strokeWidth={2.25} />
      <span>카카오톡 상담</span>
    </a>
  );
}

/**
 * 견적 폼 fallback CTA. phone·kakao 둘 다 없을 때만 단독 노출.
 * Primary brand 톤 — Submit 버튼과 동일 색 (P0-06 옵션 B).
 */
export function QuoteFallbackButton({
  block = false,
  label = "1분 견적 받기",
}: {
  block?: boolean;
  label?: string;
}) {
  return (
    <Link
      href="#quote-form"
      onClick={() => trackEvent(EVENTS.CTA_CLICK, { cta_label: "quote_fallback" })}
      className={`${BTN_BASE} bg-brand-600 shadow-brand-600/20 hover:bg-brand-700 focus-visible:ring-brand-400 text-white shadow-md ${
        block ? "w-full" : ""
      }`}
    >
      <FileText aria-hidden className="size-5" strokeWidth={2.25} />
      <span>{label}</span>
    </Link>
  );
}

/**
 * 한 줄에 phone·kakao 묶음. 둘 다 null이면 견적 fallback 1개만.
 */
export function ContactCTA({
  variant: _variant = "primary",
  layout = "row",
}: {
  variant?: Variant;
  layout?: "row" | "stack";
}) {
  void _variant;
  const { phone, kakao } = getContactInfo();
  const wrap = layout === "row" ? "flex flex-col gap-3 sm:flex-row" : "flex flex-col gap-3";

  if (!phone && !kakao) {
    return (
      <div className={wrap}>
        <QuoteFallbackButton block />
      </div>
    );
  }
  return (
    <div className={wrap}>
      <PhoneButton />
      <KakaoButton />
    </div>
  );
}
