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

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

/**
 * Hero 사이드 빠른 문의폼.
 *
 * 필드 4종 (이름·연락처·간단 메모·동의) — 실제 submitQuote 서버 액션 호출.
 * 성공 시 동일 카드에 ✅ 완료 상태 노출.
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
        className="flex h-full flex-col justify-center rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 sm:p-7"
      >
        <span className="flex size-12 items-center justify-center self-start rounded-full bg-emerald-100 text-emerald-600">
          <Check aria-hidden className="size-6" strokeWidth={2.75} />
        </span>
        <h3 className="mt-4 text-xl font-extrabold text-slate-900">
          신청이 접수되었습니다
        </h3>
        <p className="mt-2 text-sm text-slate-700">
          영업일 기준 <span className="font-bold text-brand-700">30분 이내</span>
          에 전화 또는 카톡으로 연락드릴게요.
        </p>
        {phone && (
          <a
            href={`tel:${phone.tel}`}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-3 text-sm font-extrabold text-white shadow hover:bg-accent-600"
          >
            <Phone aria-hidden className="size-4" strokeWidth={2.5} />
            지금 바로 통화하기 ({phone.display})
          </a>
        )}
      </div>
    );
  }

  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const isError = state.status === "error";

  return (
    <form
      action={action}
      className="flex h-full flex-col justify-center rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200 sm:p-6"
      noValidate
    >
      <div className="text-center">
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-accent-600">
          무료 진단 상담
        </p>
        <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
          30분 내 회신 받기
        </h3>
        <p className="mt-1 text-xs text-slate-500 sm:text-sm">
          전화 한 통이면 충분합니다.
        </p>
      </div>

      {isError && state.message && (
        <p
          role="alert"
          className="mt-3 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-800"
        >
          {state.message}
        </p>
      )}

      <div className="mt-4 space-y-3">
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
            placeholder="이름"
            className={`h-11 w-full rounded-lg border bg-white px-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
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
            placeholder="연락처 (010-1234-5678)"
            value={phoneValue}
            onChange={(e) => setPhoneValue(formatPhone(e.target.value))}
            className={`h-11 w-full rounded-lg border bg-white px-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
              fieldErrors?.phone
                ? "border-rose-400 focus:ring-rose-400/30"
                : "border-slate-300 focus:border-brand-500 focus:ring-brand-400/30"
            }`}
          />
        </label>

        <label className="block">
          <span className="sr-only">증상</span>
          <textarea
            id="symptom"
            name="symptom"
            required
            minLength={10}
            maxLength={500}
            rows={3}
            placeholder="간단히 증상을 적어주세요 (10자 이상)"
            className={`block w-full resize-none rounded-lg border bg-white px-3 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
              fieldErrors?.symptom
                ? "border-rose-400 focus:ring-rose-400/30"
                : "border-slate-300 focus:border-brand-500 focus:ring-brand-400/30"
            }`}
          />
        </label>

        <label className="flex cursor-pointer items-start gap-2 text-xs text-slate-700">
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
            에 동의합니다.
            <span className="text-rose-600">*</span>
          </span>
        </label>

        <button
          type="submit"
          disabled={pending || !agreed}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-accent-500 text-base font-extrabold text-white shadow-lg shadow-accent-500/30 transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "전송 중..." : "무료 상담 신청"}
        </button>

        {phone && (
          <a
            href={`tel:${phone.tel}`}
            className="block text-center text-xs font-bold text-slate-700 hover:text-brand-700"
          >
            바로 전화 →{" "}
            <span className="text-brand-700 underline">{phone.display}</span>
          </a>
        )}
      </div>
    </form>
  );
}
