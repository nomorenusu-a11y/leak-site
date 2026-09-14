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
export function PostCTABlock({ slug, region }: { slug: string; region?: string }) {
  const { phone, kakao } = getContactInfo();

  const btnBase =
    "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-lg px-5 text-base font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-700";

  return (
    <aside
      aria-label="상담 안내"
      className="to-brand-700 mt-12 overflow-hidden rounded-3xl border border-cyan-300/20 bg-gradient-to-br from-[#071d39] via-[#0a2c55] p-6 text-white shadow-xl shadow-slate-900/10 sm:p-8"
    >
      <p className="text-sm font-extrabold tracking-wide text-cyan-300">
        지금 확인하면 피해 범위를 줄일 수 있습니다
      </p>
      <h2 className="mt-2 text-2xl leading-tight font-black sm:text-3xl">
        더 번지기 전에
        <br className="sm:hidden" /> 점검 방향부터 확인하세요.
      </h2>
      <p className="mt-4 max-w-2xl text-base leading-7 text-white/85">
        젖은 부위의 전체 사진과 가까운 사진, 증상이 시작된 시점을 보내주세요.
        <br className="hidden sm:block" /> 현장 방문 전 확인할 순서부터 안내해드립니다.
      </p>
      <div className="mt-5 flex flex-wrap gap-2 text-sm font-bold text-cyan-100">
        <span className="rounded-full bg-white/10 px-3 py-1.5">서울 전 지역</span>
        <span className="rounded-full bg-white/10 px-3 py-1.5">경기 전 지역</span>
        <span className="rounded-full bg-white/10 px-3 py-1.5">인천 전 지역</span>
        {region && (
          <span className="rounded-full bg-cyan-300 px-3 py-1.5 text-slate-950">{region} 상담</span>
        )}
      </div>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        {phone && (
          <a
            href={`tel:${phone.tel}`}
            onClick={() => trackEvent(EVENTS.CLICK_POST_CTA, { slug, button_type: "phone" })}
            className={`${btnBase} text-brand-700 bg-white hover:bg-slate-100 focus-visible:ring-white`}
          >
            <Phone aria-hidden className="size-5" strokeWidth={2.25} />
            <span>전화로 바로 설명하기</span>
          </a>
        )}
        {kakao && (
          <a
            href={kakao.url}
            target="_blank"
            rel="noopener"
            onClick={() => trackEvent(EVENTS.CLICK_POST_CTA, { slug, button_type: "kakao" })}
            className={`${btnBase} bg-[#FEE500] text-[#191600] hover:brightness-95 focus-visible:ring-yellow-300`}
          >
            <MessageCircle aria-hidden className="size-5" strokeWidth={2.25} />
            <span>카카오로 사진 보내기</span>
          </a>
        )}
        <Link
          href="/#quote-form"
          onClick={() => trackEvent(EVENTS.CLICK_POST_CTA, { slug, button_type: "quote" })}
          className={`${btnBase} border-2 border-white/40 bg-transparent text-white hover:bg-white/10 focus-visible:ring-white`}
        >
          <FileText aria-hidden className="size-5" strokeWidth={2.25} />
          <span>온라인으로 증상 접수</span>
        </Link>
      </div>
    </aside>
  );
}
