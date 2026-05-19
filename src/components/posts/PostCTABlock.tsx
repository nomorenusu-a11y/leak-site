"use client";

import Link from "next/link";
import { Phone, MessageCircle, FileText } from "@/components/icons";
import { getContactInfo } from "@/lib/contact";
import { EVENTS, trackEvent } from "@/lib/analytics";

/**
 * 글 본문 끝 전환 블록. 브랜드 파랑 그라데이션 + 흰 텍스트.
 * phone/kakao 가용성에 따라 1~3개 CTA. "견적 신청"은 항상 노출.
 * OS 이모지 → lucide SVG.
 */
export function PostCTABlock({ slug }: { slug: string }) {
  const { phone, kakao } = getContactInfo();

  const btnBase =
    "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg px-5 text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-700";

  return (
    <aside
      aria-label="상담 안내"
      className="mt-12 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 p-6 text-white shadow-md sm:p-8"
    >
      <h2 className="text-xl font-extrabold sm:text-2xl">이런 누수, 우리 집에도?</h2>
      <p className="mt-2 text-sm text-white/90 sm:text-base">
        지금 사진 한 장만 보내주시면 견적 드립니다.
      </p>
      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        {phone && (
          <a
            href={`tel:${phone.tel}`}
            onClick={() =>
              trackEvent(EVENTS.CLICK_POST_CTA, { slug, button_type: "phone" })
            }
            className={`${btnBase} bg-white text-brand-700 hover:bg-slate-100 focus-visible:ring-white`}
          >
            <Phone aria-hidden className="size-5" strokeWidth={2.25} />
            <span>{phone.display}</span>
          </a>
        )}
        {kakao && (
          <a
            href={kakao.url}
            target="_blank"
            rel="noopener"
            onClick={() =>
              trackEvent(EVENTS.CLICK_POST_CTA, { slug, button_type: "kakao" })
            }
            className={`${btnBase} bg-[#FEE500] text-[#191600] hover:brightness-95 focus-visible:ring-yellow-300`}
          >
            <MessageCircle aria-hidden className="size-5" strokeWidth={2.25} />
            <span>카카오톡 상담</span>
          </a>
        )}
        <Link
          href="/#quote-form"
          onClick={() =>
            trackEvent(EVENTS.CLICK_POST_CTA, { slug, button_type: "quote" })
          }
          className={`${btnBase} border-2 border-white/40 bg-transparent text-white hover:bg-white/10 focus-visible:ring-white`}
        >
          <FileText aria-hidden className="size-5" strokeWidth={2.25} />
          <span>견적 신청하기</span>
        </Link>
      </div>
    </aside>
  );
}
