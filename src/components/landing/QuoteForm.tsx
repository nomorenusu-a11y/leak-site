"use client";

import Link from "next/link";
import {
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from "react";
import {
  submitQuote,
  type SubmitQuoteState,
} from "@/app/actions/submit-quote";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Field } from "@/components/ui/Field";
import { Camera, Upload, X, Check } from "@/components/icons";
import { EVENTS, trackEvent } from "@/lib/analytics";
import { readStoredUtm } from "@/lib/utm";
import { RegionStepPicker } from "@/components/landing/RegionStepPicker";

const MAX_IMAGES = 3;
const SYMPTOM_MAX = 500;
const SYMPTOM_MIN = 10;
const MAX_BYTES = 5 * 1024 * 1024;
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
  const [utmEff, setUtmEff] = useState({
    source: utmSource ?? "",
    campaign: utmCampaign ?? "",
    city: cityCode ?? "",
  });
  const [state, action, pending] = useActionState<SubmitQuoteState, FormData>(
    submitQuote,
    INITIAL,
  );

  const [phoneValue, setPhoneValue] = useState("");
  const [symptom, setSymptom] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 미리보기 URL revoke
  useEffect(() => {
    return () => {
      for (const url of previews) URL.revokeObjectURL(url);
    };
  }, [previews]);

  // 성공 시 GA
  useEffect(() => {
    if (state.status === "success") {
      trackEvent(EVENTS.SUBMIT_QUOTE, {
        utm_source: state.utmSource ?? utmEff.source ?? "(direct)",
      });
    }
  }, [state, utmEff.source]);

  // mount 후 1회 utm storage fallback
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 첫 에러 필드로 자동 focus
  useEffect(() => {
    if (state.status !== "error" || !state.fieldErrors) return;
    const order = ["customer_name", "phone", "region", "apartment", "symptom"] as const;
    const firstKey = order.find((k) => state.fieldErrors?.[k]);
    if (!firstKey) return;
    const el = document.getElementById(firstKey);
    if (el) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      (el as HTMLInputElement | HTMLTextAreaElement).focus({ preventScroll: true });
    }
  }, [state]);

  const fieldErrors =
    state.status === "error" ? state.fieldErrors : undefined;

  function addFiles(picked: File[]) {
    setFileError(null);
    const errors: string[] = [];
    const accepted: File[] = [];
    for (const f of picked) {
      if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) {
        errors.push(`${f.name}: 이미지 형식만`);
        continue;
      }
      if (f.size > MAX_BYTES) {
        errors.push(`${f.name}: 5MB 초과`);
        continue;
      }
      accepted.push(f);
    }
    const combined = [...files, ...accepted].slice(0, MAX_IMAGES);
    if (files.length + accepted.length > MAX_IMAGES) {
      errors.push(`최대 ${MAX_IMAGES}장까지 첨부 가능`);
    }
    setFiles(combined);
    for (const url of previews) URL.revokeObjectURL(url);
    setPreviews(combined.map((f) => URL.createObjectURL(f)));
    if (errors.length) setFileError(errors.join(" · "));
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleFilesChange(e: ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(e.target.files ?? []));
  }

  function handleDrop(e: React.DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragOver(false);
    addFiles(Array.from(e.dataTransfer.files ?? []));
  }

  function removeFile(idx: number) {
    const nextFiles = files.filter((_, i) => i !== idx);
    setFiles(nextFiles);
    for (const url of previews) URL.revokeObjectURL(url);
    setPreviews(nextFiles.map((f) => URL.createObjectURL(f)));
    setFileError(null);
  }

  // symptom 글자수 색상 단계 (P2-06)
  const symptomCountColor = useMemo(() => {
    const pct = (symptom.length / SYMPTOM_MAX) * 100;
    if (symptom.length > SYMPTOM_MAX) return "text-danger";
    if (pct >= 80) return "text-warning";
    return "text-slate-500";
  }, [symptom]);

  // 성공 카드
  if (state.status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8"
      >
        <div className="flex items-start gap-3">
          <Check
            aria-hidden
            className="size-7 shrink-0 text-emerald-600"
            strokeWidth={2.5}
          />
          <div>
            <h3 className="text-lg font-extrabold text-emerald-900">신청 완료!</h3>
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
          className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800"
        >
          {state.message}
        </div>
      )}

      <input type="hidden" name="utm_source" value={utmEff.source} readOnly />
      <input type="hidden" name="utm_campaign" value={utmEff.campaign} readOnly />
      <input type="hidden" name="city_code" value={utmEff.city} readOnly />

      <div className="space-y-4">
        <Field htmlFor="customer_name" label="이름" required error={fieldErrors?.customer_name}>
          <Input
            id="customer_name"
            name="customer_name"
            type="text"
            required
            minLength={2}
            maxLength={10}
            autoComplete="name"
            placeholder="홍길동"
            invalid={!!fieldErrors?.customer_name}
            aria-invalid={!!fieldErrors?.customer_name}
            aria-describedby={fieldErrors?.customer_name ? "customer_name-error" : undefined}
          />
        </Field>

        <Field htmlFor="phone" label="연락처" required error={fieldErrors?.phone}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            inputMode="numeric"
            autoComplete="tel"
            placeholder="010-1234-5678"
            value={phoneValue}
            onChange={(e) => setPhoneValue(formatPhone(e.target.value))}
            invalid={!!fieldErrors?.phone}
            aria-invalid={!!fieldErrors?.phone}
            aria-describedby={fieldErrors?.phone ? "phone-error" : undefined}
          />
        </Field>

        <Field htmlFor="region" label="지역 (시·구)" error={fieldErrors?.region}>
          <RegionStepPicker
            invalid={!!fieldErrors?.region}
            errorId={fieldErrors?.region ? "region-error" : undefined}
          />
        </Field>

        <Field htmlFor="apartment" label="상세주소" error={fieldErrors?.apartment}>
          <Input
            id="apartment"
            name="apartment"
            type="text"
            maxLength={50}
            placeholder="상세주소를 입력해주세요 (예: 래미안아파트 101동 1502호)"
            invalid={!!fieldErrors?.apartment}
            aria-invalid={!!fieldErrors?.apartment}
            aria-describedby={fieldErrors?.apartment ? "apartment-error" : undefined}
          />
        </Field>

        <Field
          htmlFor="symptom"
          label="증상 설명"
          required
          error={fieldErrors?.symptom}
          trailing={
            <span
              className={`text-xs font-semibold ${symptomCountColor}`}
              role="status"
              aria-live="polite"
            >
              {symptom.length}/{SYMPTOM_MAX}
            </span>
          }
        >
          <Textarea
            id="symptom"
            name="symptom"
            required
            minLength={SYMPTOM_MIN}
            maxLength={SYMPTOM_MAX}
            rows={4}
            placeholder="예) 안방 천장에서 물이 떨어집니다. 어제부터 흔적이 점점 커지고 있어요."
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            invalid={!!fieldErrors?.symptom}
            aria-invalid={!!fieldErrors?.symptom}
            aria-describedby={fieldErrors?.symptom ? "symptom-error" : undefined}
          />
        </Field>

        {/* 파일 드롭존 (P1-09) */}
        <div>
          <p className="mb-1.5 text-sm font-bold text-slate-800">
            사진 첨부{" "}
            <span className="font-normal text-slate-500">
              (선택 · 최대 {MAX_IMAGES}장 · 5MB 이내)
            </span>
          </p>
          <label
            htmlFor="images"
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-center transition-colors ${
              dragOver
                ? "border-brand-500 bg-brand-50"
                : "border-slate-300 bg-slate-50 hover:bg-slate-100"
            } ${files.length >= MAX_IMAGES ? "pointer-events-none opacity-60" : ""}`}
          >
            <Upload aria-hidden className="size-5 text-slate-500" />
            <span className="text-sm font-semibold text-slate-700">
              파일 선택 또는 끌어 놓기
            </span>
            <span className="text-xs text-slate-500">
              모바일은 카메라로 바로 촬영 가능
            </span>
          </label>
          <input
            id="images"
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            multiple
            capture="environment"
            onChange={handleFilesChange}
            disabled={files.length >= MAX_IMAGES}
            className="sr-only"
          />
          {fileError && (
            <p className="mt-1.5 text-xs font-semibold text-danger">{fileError}</p>
          )}
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
                    className="absolute right-1 top-1 inline-flex size-6 items-center justify-center rounded-full bg-black/70 text-white hover:bg-black"
                    aria-label={`사진 ${i + 1} 삭제`}
                  >
                    <X aria-hidden className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {/* 시각적 hint icon — 카메라 직촬영 (스크린리더에는 위 라벨 텍스트로 충분) */}
          {previews.length === 0 && (
            <p className="mt-2 hidden text-xs text-slate-500 sm:block">
              <Camera aria-hidden className="mb-0.5 mr-1 inline size-3.5" />
              증상 부위가 잘 보이도록 가까이에서 촬영해 주세요.
            </p>
          )}
        </div>

        {/* 개인정보 동의 (P0-03) */}
        <label className="flex cursor-pointer items-start gap-2 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
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
              className="font-semibold text-brand-700 hover:underline"
            >
              개인정보 수집·이용
            </Link>
            에 동의합니다.
            <span className="text-danger">*</span>
          </span>
        </label>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          block
          loading={pending}
          disabled={!agreed}
        >
          {pending ? "전송 중..." : "30분 안에 회신 받기"}
        </Button>
      </div>
    </form>
  );
}
