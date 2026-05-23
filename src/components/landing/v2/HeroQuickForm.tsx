"use client";

import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
import {
  submitQuote,
  type SubmitQuoteState,
} from "@/app/actions/submit-quote";
import { Phone, Check } from "@/components/icons";
import { BUSINESS } from "@/lib/business";
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
 * Hero 사이드 빠른 문의폼 — 좁은 column(약 20% 폭) 컴팩트 버전.
 *
 * 구조: 상단 brand 컬러 헤더 바 → 입력 2개 → 동의 → CTA → 전화번호 링크
 * 필드: 이름 / 연락처 / 동의 (symptom 자동 hidden)
 * 실제 submitQuote 서버 액션 → DB(leak_requests) 등록.
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
        <div className="bg-brand-700 px-4 py-3 text-center text-white">
          <p className="text-sm font-extrabold tracking-tight">접수 완료</p>
        </div>
        <div className="flex flex-1 flex-col justify-center p-5">
          <span className="flex size-11 items-center justify-center self-start rounded-full bg-emerald-100 text-emerald-600">
            <Check aria-hidden className="size-5" strokeWidth={2.75} />
          </span>
          <h3 className="mt-3 text-lg font-extrabold text-slate-900">
            신청이 접수되었습니다
          </h3>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-700 sm:text-sm">
            영업일 기준{" "}
            <span className="font-bold text-brand-700">30분 이내</span>에 연락
            드릴게요.
          </p>
          {phone && (
            <a
              href={`tel:${phone.tel}`}
              className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-accent-500 px-3 py-2.5 text-xs font-extrabold text-white shadow hover:bg-accent-600"
            >
              <Phone aria-hidden className="size-3.5" strokeWidth={2.5} />
              바로 통화하기
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
      className="flex h-full flex-col bg-white"
      noValidate
    >
      {/* 상단 brand 헤더 바 */}
      <div className="bg-brand-700 px-4 py-3 text-center text-white">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-200">
          무료 진단 상담
        </p>
        <p className="mt-0.5 text-sm font-extrabold tracking-tight sm:text-base">
          30분 내 회신 받기
        </p>
      </div>

      <div className="flex flex-1 flex-col justify-center p-4 sm:p-5">
        {isError && state.message && (
          <p
            role="alert"
            className="mb-2 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-semibold text-rose-800"
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

        <div className="space-y-2">
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
              className={`h-10 w-full rounded-md border bg-white px-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
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
              className={`h-10 w-full rounded-md border bg-white px-2.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                fieldErrors?.phone
                  ? "border-rose-400 focus:ring-rose-400/30"
                  : "border-slate-300 focus:border-brand-500 focus:ring-brand-400/30"
              }`}
            />
          </label>

          <label className="flex cursor-pointer items-start gap-1.5 text-[11px] text-slate-700">
            <input
              type="checkbox"
              name="agree"
              required
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 size-3.5 rounded border-slate-400 accent-brand-600"
            />
            <span>
              <Link
                href="/privacy"
                target="_blank"
                className="font-bold text-brand-700 hover:underline"
              >
                개인정보 수집·이용
              </Link>
              에 동의 <span className="text-rose-600">*</span>
            </span>
          </label>

          <button
            type="submit"
            disabled={pending || !agreed}
            className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-accent-500 text-sm font-extrabold text-white shadow-md shadow-accent-500/30 transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
          >
            {pending ? "전송 중..." : "상담 신청"}
          </button>

          {phone && (
            <a
              href={`tel:${phone.tel}`}
              className="mt-1 block rounded-md border border-brand-200 bg-brand-50 px-2 py-2 text-center text-sm font-extrabold text-brand-700 hover:bg-brand-100"
            >
              <span className="inline-flex items-center gap-1">
                <Phone
                  aria-hidden
                  className="size-3.5"
                  strokeWidth={2.5}
                />
                {phone.display}
              </span>
            </a>
          )}
        </div>
      </div>
    </form>
  );
}
