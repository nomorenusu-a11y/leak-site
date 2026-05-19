"use client";

import Link from "next/link";
import { getContactInfo } from "@/lib/contact";
import { EVENTS, trackEvent } from "@/lib/analytics";

type Variant = "primary" | "ghost";

const BTN_BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-colors min-h-[48px] px-5 text-base";

/**
 * 전화 CTA. phone 미설정·잘못된 형식이면 **렌더 안 함**.
 * 사용 시: contact가 보장되는 곳에서만 호출하거나, `ContactCTA`처럼 묶음 사용.
 */
export function PhoneButton({
  variant = "primary",
  block = false,
}: {
  variant?: Variant;
  block?: boolean;
}) {
  const { phone } = getContactInfo();
  if (!phone) return null;

  const styles =
    variant === "primary"
      ? "bg-accent-500 text-white hover:bg-accent-600 shadow-md shadow-accent-500/30"
      : "border-2 border-white/40 text-white hover:bg-white/10";
  return (
    <a
      href={`tel:${phone.tel}`}
      onClick={() => trackEvent(EVENTS.CLICK_CALL, { cta_label: "phone" })}
      className={`${BTN_BASE} ${styles} ${block ? "w-full" : ""}`}
      aria-label={`전화 ${phone.display}로 상담`}
    >
      <span aria-hidden>📞</span>
      <span>{phone.display}</span>
    </a>
  );
}

/**
 * 카톡 CTA. kakao 미설정이면 **렌더 안 함**.
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
      className={`${BTN_BASE} bg-[#FEE500] text-[#191600] hover:brightness-95 ${
        block ? "w-full" : ""
      }`}
      aria-label="카카오톡 채널로 상담"
    >
      <span aria-hidden>💬</span>
      <span>카카오톡 상담</span>
    </a>
  );
}

/**
 * 견적 폼으로 스크롤 fallback CTA. phone·kakao 둘 다 없을 때 폼으로 유도.
 */
export function QuoteFallbackButton({
  variant = "primary",
  block = false,
  label = "아래 견적 폼에서 빠른 견적 받기",
}: {
  variant?: Variant;
  block?: boolean;
  label?: string;
}) {
  const styles =
    variant === "primary"
      ? "bg-accent-500 text-white hover:bg-accent-600 shadow-md shadow-accent-500/30"
      : "border-2 border-white/40 text-white hover:bg-white/10";
  return (
    <Link
      href="#quote-form"
      onClick={() => trackEvent(EVENTS.CTA_CLICK, { cta_label: "quote_fallback" })}
      className={`${BTN_BASE} ${styles} ${block ? "w-full" : ""}`}
    >
      <span aria-hidden>📝</span>
      <span>{label}</span>
    </Link>
  );
}

/**
 * 한 줄에 phone·kakao 묶음. 둘 다 null이면 견적 fallback 1개만.
 * Hero / StickyCTA / not-found 등 여러 곳에서 사용.
 */
export function ContactCTA({
  variant = "primary",
  layout = "row",
}: {
  variant?: Variant;
  layout?: "row" | "stack";
}) {
  const { phone, kakao } = getContactInfo();
  const wrap =
    layout === "row" ? "flex flex-col gap-3 sm:flex-row" : "flex flex-col gap-3";

  if (!phone && !kakao) {
    return (
      <div className={wrap}>
        <QuoteFallbackButton variant={variant} block />
      </div>
    );
  }
  return (
    <div className={wrap}>
      <PhoneButton variant={variant} />
      <KakaoButton />
    </div>
  );
}
