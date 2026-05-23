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

/** symptom 기본값 — narrow 폼에는 텍스트영역 없음. 통화 시 상세 확보. */
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
 * Hero 사이드 빠른 문의폼 — 좁은 column(약 20% 폭)에 맞춘 컴팩트 버전.
 *
 * 필드: 이름 / 연락처 / 동의 (symptom은 hidden 기본값으로 자동 채움)
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
        className="flex h-full flex-col justify-center bg-white p-5 sm:p-6"
      >
        <span className="flex size-11 items-center justify-center self-start rounded-full bg-emerald-100 text-emerald-600">
          <Check aria-hidden className="size-5" strokeWidth={2.75} />
        </span>
        <h3 className="mt-3 text-lg font-extrabold text-slate-900">
          접수 완료
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
    );
  }

  const fieldErrors = state.status === "error" ? state.fieldErrors : undefined;
  const isError = state.status === "error";

  return (
    <form
      action={action}
      className="flex h-full flex-col justify-center bg-white p-4 sm:p-5"
      noValidate
    >
      {/* 헤더 */}
      <div className="text-center">
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-accent-600">
          무료 진단 상담
        </p>
        <h3 className="mt-0.5 text-base font-black tracking-tight text-slate-900 sm:text-lg">
          30분 내 회신
        </h3>
        <p className="mt-0.5 text-[11px] text-slate-500">
          전화 한 통이면 충분합니다.
        </p>
      </div>

      {isError && state.message && (
        <p
          role="alert"
          className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-semibold text-rose-800"
        >
          {state.message}
        </p>
      )}

      {/* hidden symptom — narrow 폼에는 textarea 없이 기본값 전송 */}
      <input
        type="hidden"
        name="symptom"
        value={HERO_QUICK_DEFAULT_SYMPTOM}
        readOnly
      />

      <div className="mt-3 space-y-2">
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
            placeholder="010-1234-5678"
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
              개인정보 수집
            </Link>
            에 동의 <span className="text-rose-600">*</span>
          </span>
        </label>

        <button
          type="submit"
          disabled={pending || !agreed}
          className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-accent-500 text-sm font-extrabold text-white shadow-md shadow-accent-500/30 transition hover:bg-accent-600 disabled:cursor-not-allowed disabled:opacity-60 sm:text-base"
        >
          {pending ? "전송 중..." : "무료 상담 신청"}
        </button>

        {phone && (
          <a
            href={`tel:${phone.tel}`}
            className="block text-center text-[11px] font-bold text-slate-700 hover:text-brand-700"
          >
            바로 전화 →{" "}
            <span className="text-brand-700 underline">{phone.display}</span>
          </a>
        )}
      </div>
    </form>
  );
}
