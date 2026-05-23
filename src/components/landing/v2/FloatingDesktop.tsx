"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Phone, ArrowUp } from "@/components/icons";
import { NaverLogo, KakaoLogo } from "@/components/icons/BrandLogos";
import { getContactInfo } from "@/lib/contact";
import { BUSINESS } from "@/lib/business";
import { EVENTS, trackEvent } from "@/lib/analytics";

/**
 * 데스크탑 우측 고정 플로팅 (md+).
 *
 * 위→아래 구성:
 *   1) 앵커 메뉴: 회사소개·서비스·작업사례·최신장비·후기·문의
 *   2) 전화 (orange, 큰 강조)
 *   3) 카카오톡 오픈채팅 (yellow)
 *   4) 네이버 블로그 (green)
 *   5) TOP (스크롤 600+에서 노출)
 *
 * 모바일은 MobileBottomBar가 담당 — 여기는 md 이상만 렌더.
 */
export function FloatingDesktop() {
  const { phone, kakao } = getContactInfo();
  const kakaoHref = kakao?.url ?? BUSINESS.kakaoChatUrl;
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

  const anchors = [
    { href: "/#about", label: "회사소개" },
    { href: "/#services", label: "서비스" },
    { href: "/posts", label: "작업사례" },
    { href: "/#equipment", label: "최신장비" },
    { href: "/#reviews", label: "고객후기" },
    { href: "/#quote-form", label: "문의하기" },
  ];

  return (
    <aside
      aria-label="빠른 연락"
      className="pointer-events-none fixed right-3 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-stretch gap-2 md:flex"
    >
      {/* 앵커 메뉴 카드 */}
      <nav
        aria-label="빠른 이동"
        className="pointer-events-auto w-28 overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200"
      >
        <ul className="divide-y divide-slate-100">
          {anchors.map((a) => (
            <li key={a.href}>
              <Link
                href={a.href}
                className="block px-3 py-2 text-center text-[12px] font-bold text-slate-700 hover:bg-brand-50 hover:text-brand-700"
              >
                {a.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* 전화 */}
      {phone && (
        <a
          href={`tel:${phone.tel}`}
          onClick={() =>
            trackEvent(EVENTS.CLICK_CALL, { cta_label: "floating_call" })
          }
          aria-label={`전화 ${phone.display}로 상담`}
          className="pointer-events-auto flex w-28 flex-col items-center gap-1 rounded-2xl bg-accent-500 px-2 py-3 text-white shadow-lg shadow-accent-500/30 hover:bg-accent-600"
        >
          <Phone aria-hidden className="size-6" strokeWidth={2.25} />
          <span className="text-[10px] font-extrabold">전화상담</span>
        </a>
      )}

      {/* 카카오톡 */}
      <a
        href={kakaoHref}
        target="_blank"
        rel="noopener"
        onClick={() =>
          trackEvent(EVENTS.CLICK_KAKAO, { cta_label: "floating_kakao" })
        }
        aria-label="카카오톡 상담"
        className="pointer-events-auto flex w-28 flex-col items-center gap-1 rounded-2xl bg-[#FEE500] px-2 py-3 text-[#3C1E1E] shadow-lg hover:brightness-95"
      >
        <KakaoLogo aria-hidden className="size-6" />
        <span className="text-[10px] font-extrabold">카톡상담</span>
      </a>

      {/* 네이버 블로그 */}
      <a
        href={BUSINESS.blogUrl}
        target="_blank"
        rel="noopener"
        onClick={() =>
          trackEvent(EVENTS.CTA_CLICK, { cta_label: "floating_blog" })
        }
        aria-label="네이버 블로그"
        className="pointer-events-auto flex w-28 flex-col items-center gap-1 rounded-2xl bg-[#03C75A] px-2 py-3 text-white shadow-lg hover:brightness-95"
      >
        <NaverLogo aria-hidden className="size-6" />
        <span className="text-[10px] font-extrabold">블로그</span>
      </a>

      {/* TOP */}
      <button
        type="button"
        onClick={toTop}
        aria-label="맨 위로"
        className={`pointer-events-auto flex w-28 flex-col items-center gap-1 rounded-2xl bg-slate-800 px-2 py-3 text-white shadow-lg hover:bg-slate-900 ${
          showTop ? "opacity-100" : "pointer-events-none opacity-0"
        } transition-opacity`}
      >
        <ArrowUp aria-hidden className="size-6" strokeWidth={2.25} />
        <span className="text-[10px] font-extrabold">TOP</span>
      </button>
    </aside>
  );
}
