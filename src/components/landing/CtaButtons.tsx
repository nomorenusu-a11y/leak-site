"use client";

import { siteConfig } from "@/lib/env";
import { EVENTS, trackEvent } from "@/lib/analytics";

type Variant = "primary" | "ghost";

export function PhoneButton({
  variant = "primary",
  block = false,
}: {
  variant?: Variant;
  block?: boolean;
}) {
  const phone = siteConfig.phone;
  const display = phone
    ? phone.replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, "$1-$2-$3")
    : "전화 상담";
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-colors min-h-[48px] px-5 text-base";
  const styles =
    variant === "primary"
      ? "bg-accent-500 text-white hover:bg-accent-600 shadow-md shadow-accent-500/30"
      : "border-2 border-white/40 text-white hover:bg-white/10";
  return (
    <a
      href={phone ? `tel:${phone}` : "#"}
      onClick={() => trackEvent(EVENTS.CLICK_CALL, { cta_label: "phone" })}
      className={`${base} ${styles} ${block ? "w-full" : ""}`}
      aria-label="전화로 상담하기"
    >
      <span aria-hidden>📞</span>
      <span>{display}</span>
    </a>
  );
}

export function KakaoButton({
  variant = "ghost",
  block = false,
}: {
  variant?: Variant;
  block?: boolean;
}) {
  const kakao = siteConfig.kakao;
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-colors min-h-[48px] px-5 text-base";
  const styles =
    variant === "primary"
      ? "bg-[#FEE500] text-[#191600] hover:brightness-95"
      : "bg-[#FEE500] text-[#191600] hover:brightness-95";
  return (
    <a
      href={kakao || "#"}
      target="_blank"
      rel="noopener"
      onClick={() => trackEvent(EVENTS.CLICK_KAKAO, { cta_label: "kakao" })}
      className={`${base} ${styles} ${block ? "w-full" : ""}`}
      aria-label="카카오톡 채널로 상담하기"
    >
      <span aria-hidden>💬</span>
      <span>카카오톡 상담</span>
    </a>
  );
}
