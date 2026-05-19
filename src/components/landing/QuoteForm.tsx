"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  submitQuote,
  type SubmitQuoteState,
} from "@/app/actions/submit-quote";
import { EVENTS, trackEvent } from "@/lib/analytics";
import { readStoredUtm } from "@/lib/utm";

const MAX_IMAGES = 3;
const SYMPTOM_MAX = 500;
const SYMPTOM_MIN = 10;

const ACCEPT = "image/jpeg,image/png,image/webp";

type Props = {
  utmSource?: string;
  utmCampaign?: string;
  cityCode?: string;
};

const INITIAL: SubmitQuoteState = { status: "idle" };

function formatPhone(raw: string): string {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length < 4) return d;
  if (d.length < 8) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
}

export function QuoteForm({ utmSource, utmCampaign, cityCode }: Props) {
  // UTM/city 가 props로 비어 들어오면 sessionStorage(이전 광고 클릭 흔적)에서 fallback.
  // SSR 시점은 props 그대로 사용 → 첫 렌더는 prop 값으로 hydration, mount 후 storage 보강.
  const initialUtm = {
    source: utmSource ?? "",
    campaign: utmCampaign ?? "",
    city: cityCode ?? "",
  };
  const [utmEff, setUtmEff] = useState(initialUtm);
  const [state, action, pending] = useActionState<SubmitQuoteState, FormData>(
    submitQuote,
    INITIAL,
  );

  // 입력 상태 (제어): 전화 자동 하이픈, 글자 수 표시 등 클라이언트 UX 위함.
  const [phone, setPhone] = useState("");
  const [symptom, setSymptom] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 미리보기 URL 정리
  useEffect(() => {
    return () => {
      for (const url of previews) URL.revokeObjectURL(url);
    };
  }, [previews]);

  // 성공 시 GA 이벤트
  useEffect(() => {
    if (state.status === "success") {
      trackEvent(EVENTS.SUBMIT_QUOTE, {
        utm_source: state.utmSource ?? utmEff.source ?? "(direct)",
      });
    }
  }, [state, utmEff.source]);

  // 마운트 후 1회: prop이 비었으면 sessionStorage utm 보강 (외부 storage 동기화)
  useEffect(() => {
    if (utmSource || utmCampaign || cityCode) return;
    const stored = readStoredUtm();
    if (!stored) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUtmEff({
      source: stored.utm_source ?? "",
      campaign: stored.utm_campaign ?? "",
      city: stored.city_code ?? "",
    });
    // 의도적으로 mount 1회만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fieldErrors =
    state.status === "error" ? state.fieldErrors : undefined;

  function handleFilesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    const combined = [...files, ...picked].slice(0, MAX_IMAGES);
    setFiles(combined);

    // revoke previous previews, generate new
    for (const url of previews) URL.revokeObjectURL(url);
    setPreviews(combined.map((f) => URL.createObjectURL(f)));

    // 같은 파일 다시 고를 수 있게 input 비우기
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(idx: number) {
    const nextFiles = files.filter((_, i) => i !== idx);
    setFiles(nextFiles);
    for (const url of previews) URL.revokeObjectURL(url);
    setPreviews(nextFiles.map((f) => URL.createObjectURL(f)));
  }

  // 성공 카드
  if (state.status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8">
        <div className="flex items-start gap-3">
          <span aria-hidden className="text-3xl">✅</span>
          <div>
            <h3 className="text-lg font-extrabold text-emerald-900">
              신청 완료!
            </h3>
            <p className="mt-1 text-sm text-emerald-800">
              영업일 기준 1시간 안에 전화 또는 카톡으로 연락드릴게요.
              <br />
              긴급한 경우 상단 전화번호로 직접 통화 부탁드립니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const isError = state.status === "error";

  return (
    <form
      action={(formData) => {
        // images는 controlled state(files)에서 채워서 보냄. file input의 name="images"는 빈 값이 함께 갈 수 있어 제거하고 다시 채움.
        formData.delete("images");
        for (const f of files) formData.append("images", f);
        return action(formData);
      }}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
      noValidate
    >
      {isError && (
        <div
          role="alert"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {state.message}
        </div>
      )}

      {/* hidden — 광고 추적 (sessionStorage fallback 적용된 effective 값) */}
      <input type="hidden" name="utm_source" value={utmEff.source} readOnly />
      <input type="hidden" name="utm_campaign" value={utmEff.campaign} readOnly />
      <input type="hidden" name="city_code" value={utmEff.city} readOnly />

      <div className="space-y-4">
        <Field label="이름" name="customer_name" required error={fieldErrors?.customer_name}>
          <input
            id="customer_name"
            name="customer_name"
            type="text"
            required
            minLength={2}
            maxLength={10}
            autoComplete="name"
            placeholder="홍길동"
            className={inputClass(!!fieldErrors?.customer_name)}
          />
        </Field>

        <Field label="연락처" name="phone" required error={fieldErrors?.phone}>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            inputMode="numeric"
            autoComplete="tel"
            placeholder="010-1234-5678"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            className={inputClass(!!fieldErrors?.phone)}
          />
        </Field>

        <Field label="지역 (시·구)" name="region" error={fieldErrors?.region}>
          <input
            id="region"
            name="region"
            type="text"
            maxLength={50}
            placeholder="예) 서울 강남구"
            className={inputClass(!!fieldErrors?.region)}
          />
        </Field>

        <Field label="아파트명" name="apartment" error={fieldErrors?.apartment}>
          <input
            id="apartment"
            name="apartment"
            type="text"
            maxLength={50}
            placeholder="예) 래미안아파트 101동"
            className={inputClass(!!fieldErrors?.apartment)}
          />
        </Field>

        <Field
          label="증상 설명"
          name="symptom"
          required
          error={fieldErrors?.symptom}
          hint={`${symptom.length}/${SYMPTOM_MAX}`}
        >
          <textarea
            id="symptom"
            name="symptom"
            required
            minLength={SYMPTOM_MIN}
            maxLength={SYMPTOM_MAX}
            rows={4}
            placeholder="예) 안방 천장에서 물이 떨어집니다. 어제부터 흔적이 점점 커지고 있어요."
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            className={`${inputClass(!!fieldErrors?.symptom)} resize-y`}
          />
        </Field>

        {/* 사진 첨부 */}
        <div>
          <label className="mb-1.5 block text-sm font-bold text-slate-800">
            사진 첨부 <span className="font-normal text-slate-500">(선택 · 최대 {MAX_IMAGES}장 · 5MB 이내)</span>
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            multiple
            onChange={handleFilesChange}
            disabled={files.length >= MAX_IMAGES}
            className="block w-full text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100 disabled:opacity-50"
          />
          {previews.length > 0 && (
            <ul className="mt-3 grid grid-cols-3 gap-2">
              {previews.map((src, i) => (
                <li
                  key={src}
                  className="relative overflow-hidden rounded-lg border border-slate-200"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`첨부 사진 ${i + 1}`}
                    className="aspect-square w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute right-1 top-1 rounded-full bg-black/70 px-2 py-0.5 text-xs font-bold text-white hover:bg-black"
                    aria-label={`사진 ${i + 1} 삭제`}
                  >
                    삭제
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-6 py-3.5 text-base font-extrabold text-white shadow-md shadow-brand-600/20 transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none"
        >
          {pending ? "전송 중..." : "무료 견적 신청하기"}
        </button>
        <p className="text-center text-xs text-slate-500">
          제출하시면 상담 목적의 연락에 동의하신 것으로 간주됩니다.
        </p>
      </div>
    </form>
  );
}

function inputClass(error: boolean) {
  return `w-full rounded-lg border ${
    error ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"
  } px-3.5 py-2.5 text-base text-slate-900 placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200`;
}

function Field({
  label,
  name,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={name} className="block text-sm font-bold text-slate-800">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
        {hint && <span className="text-xs text-slate-500">{hint}</span>}
      </div>
      {children}
      {error && <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}
