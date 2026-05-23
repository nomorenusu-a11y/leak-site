"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import {
  submitQuote,
  type SubmitQuoteState,
} from "@/app/actions/submit-quote";
import { Phone, Check } from "@/components/icons";
import { KakaoLogo } from "@/components/icons/BrandLogos";
import { BUSINESS } from "@/lib/business";
import { siteConfig } from "@/lib/env";
import { EVENTS, trackEvent } from "@/lib/analytics";

const INITIAL: SubmitQuoteState = { status: "idle" };

const HERO_QUICK_DEFAULT_SYMPTOM =
  "[Hero 빠른 상담] 자세한 증상은 통화 시 안내드릴 예정입니다.";

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

/**
 * Hero 사이드 상담 신청폼 — 광고 LP 톤.
 *
 * 구조: 상단 brand 헤더 → 큰 로고 → 이름·연락처 input → 동의 → 풀폭 CTA → 큰 전화번호
 * 실제 submitQuote 액션 → DB(leak_requests) 등록.
 */
export function HeroQuickForm() {
  const phone = BUSINESS.contact.phone;
  const [state, action, pending] = useActionState<SubmitQuoteState, FormData>(
    submitQuote,
    INITIAL,
  );
  const [phoneValue, setPhoneValue] = useState("");
  const [agreed, setAgreed] = useState(false);

  useEffect(() => {
    if (state.status === "success") {
      trackEvent(EVENTS.SUBMIT_QUOTE, {
        utm_source: state.utmSource ?? "hero_quick_form",
      });
    }
  }, [state]);

  if (state.status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex h-full flex-col bg-white"
      >
        <div className="bg-brand-700 px-5 py-3 text-center text-white">
          <p className="text-sm font-extrabold tracking-tight sm:text-base">
            접수 완료
          </p>
        </div>
        <div className="flex flex-1 flex-col justify-center p-6">
          <span className="flex size-14 items-center justify-center self-center rounded-full bg-emerald-100 text-emerald-600">
            <Check aria-hidden className="size-7" strokeWidth={2.75} />
          </span>
          <h3 className="mt-4 text-center text-xl font-extrabold text-slate-900">
            신청이 접수되었습니다
          </h3>
          <p className="mt-2 text-center text-sm leading-relaxed text-slate-700">
            영업일 기준{" "}
            <span className="font-bold text-brand-700">30분 이내</span>에<br />
            전화 또는 카톡으로 연락드릴게요.
          </p>
          {phone && (
            <a
              href={`tel:${phone.tel}`}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-3 text-sm font-extrabold text-white shadow-md hover:bg-accent-600"
            >
              <Phone aria-hidden className="size-4" strokeWidth={2.5} />
              지금 바로 통화하기
            </a>
          )}
        </div>
      </div>
    );
  }

  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const isError = state.status === "error";

  return (
    <form
      action={action}
      className="flex h-full flex-col bg-white shadow-2xl shadow-black/10"
      noValidate
    >
      {/* 상단 brand 헤더 띠 */}
      <div className="bg-brand-700 px-6 py-4 text-center text-white">
        <p className="text-xs font-extrabold uppercase tracking-widest text-cyan-200">
          무료 진단 상담
        </p>
        <p className="mt-1 text-base font-extrabold tracking-tight sm:text-lg">
          30분 내 회신 받기
        </p>
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        {/* 로고 */}
        <div className="flex justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2"
            aria-label={`${siteConfig.name} 홈으로`}
          >
            <Image
              src="/logo.png"
              alt=""
              width={48}
              height={48}
              priority
              className="rounded-md"
            />
            <span className="text-lg font-black tracking-tight text-brand-700 sm:text-xl">
              {siteConfig.name}
            </span>
          </Link>
        </div>

        {isError && state.message && (
          <p
            role="alert"
            className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800"
          >
            {state.message}
          </p>
        )}

        {/* hidden symptom */}
        <input
          type="hidden"
          name="symptom"
          value={HERO_QUICK_DEFAULT_SYMPTOM}
          readOnly
        />

        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="sr-only">이름</span>
            <input
              id="customer_name"
              name="customer_name"
              type="text"
              required
              minLength={2}
              maxLength={10}
              autoComplete="name"
              placeholder="이름을 입력해주세요"
              className={`h-14 w-full rounded-lg border bg-white px-4 text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                fieldErrors?.customer_name
                  ? "border-rose-400 focus:ring-rose-400/30"
                  : "border-slate-300 focus:border-brand-500 focus:ring-brand-400/30"
              }`}
            />
          </label>

          <label className="block">
            <span className="sr-only">연락처</span>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="numeric"
              required
              autoComplete="tel"
              placeholder="연락처를 입력해주세요"
              value={phoneValue}
              onChange={(e) => setPhoneValue(formatPhone(e.target.value))}
              className={`h-14 w-full rounded-lg border bg-white px-4 text-base font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                fieldErrors?.phone
                  ? "border-rose-400 focus:ring-rose-400/30"
                  : "border-slate-300 focus:border-brand-500 focus:ring-brand-400/30"
              }`}
            />
          </label>

          <label className="flex cursor-pointer items-start gap-2 pt-1 text-xs text-slate-700">
            <input
              type="checkbox"
              name="agree"
              required
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 size-4 rounded border-slate-400 accent-brand-600"
            />
            <span>
              <Link
                href="/privacy"
                target="_blank"
                className="font-bold text-brand-700 hover:underline"
              >
                개인정보 수집·이용
              </Link>
              에 동의합니다 <span className="text-rose-600">*</span>
            </span>
          </label>

          <button
            type="submit"
            disabled={pending || !agreed}
            className="inline-flex h-16 w-full flex-col items-center justify-center gap-0 rounded-xl bg-brand-600 text-lg font-extrabold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{pending ? "전송 중..." : "무료 상담 신청"}</span>
            <span className="text-xs font-medium text-white/80">
              담당자가 30분 안에 연락드립니다
            </span>
          </button>
        </div>

        {/* 전화번호 — 큰 강조 */}
        {phone && (
          <a
            href={`tel:${phone.tel}`}
            className="mt-4 block rounded-xl border-2 border-brand-200 bg-brand-50 px-3 py-3 text-center hover:bg-brand-100"
          >
            <span className="block text-[10px] font-extrabold uppercase tracking-widest text-brand-600">
              긴급출동 직통
            </span>
            <span className="mt-0.5 inline-flex items-center gap-1.5 text-xl font-black tracking-tight text-brand-900 sm:text-2xl">
              <Phone aria-hidden className="size-5" strokeWidth={2.5} />
              {phone.display}
            </span>
          </a>
        )}

        {/* 빈 공간 채우기 — 신뢰 배지·카톡·디스클레이머 */}
        <div className="mt-auto pt-4">
          {/* 3개 신뢰 배지 */}
          <ul className="grid grid-cols-1 gap-1.5 border-t border-slate-100 pt-3 text-[11px] text-slate-700">
            <li className="flex items-center gap-1.5">
              <Check
                aria-hidden
                className="size-3.5 shrink-0 text-emerald-600"
                strokeWidth={3}
              />
              <span className="font-semibold">365일 24시간 출동</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check
                aria-hidden
                className="size-3.5 shrink-0 text-emerald-600"
                strokeWidth={3}
              />
              <span className="font-semibold">무료 현장 진단</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Check
                aria-hidden
                className="size-3.5 shrink-0 text-emerald-600"
                strokeWidth={3}
              />
              <span className="font-semibold">시공 후 1년 무상 A/S</span>
            </li>
          </ul>

          {/* 카카오톡 버튼 */}
          <a
            href={BUSINESS.kakaoChatUrl}
            target="_blank"
            rel="noopener"
            onClick={() =>
              trackEvent(EVENTS.CLICK_KAKAO, { cta_label: "hero_form_kakao" })
            }
            className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#FEE500] text-sm font-extrabold text-[#3C1E1E] shadow-md transition hover:brightness-95"
          >
            <KakaoLogo aria-hidden className="size-5" />
            <span>카카오톡으로 빠른 상담</span>
          </a>

          {/* 디스클레이머 */}
          <p className="mt-2.5 text-center text-[10px] leading-relaxed text-slate-400">
            * 상담 내용은 외부 유출 없이 안전하게 처리됩니다
          </p>
        </div>
      </div>
    </form>
  );
}
