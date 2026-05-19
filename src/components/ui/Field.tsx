import type { ReactNode } from "react";
import { AlertCircle } from "@/components/icons";

type Props = {
  /** input의 id와 일치해야 함 (htmlFor) */
  htmlFor: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  /** 우측 상단 보조 텍스트 (글자 수 카운터 등) */
  trailing?: ReactNode;
  children: ReactNode;
};

/**
 * 폼 필드 묶음: label + input + helper + error.
 * 에러 노출 시 `id="<name>-error"`로 input의 `aria-describedby`와 연결할 것.
 * 색·접근성·간격 전역 일관.
 */
export function Field({ htmlFor, label, required, error, hint, trailing, children }: Props) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="block text-sm font-bold text-slate-800">
          {label}
          {required && <span className="ml-0.5 text-danger" aria-hidden>*</span>}
          {required && <span className="sr-only">필수</span>}
        </label>
        {trailing}
      </div>
      {children}
      {error ? (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-danger"
        >
          <AlertCircle aria-hidden className="size-3.5" />
          {error}
        </p>
      ) : hint ? (
        <p id={`${htmlFor}-hint`} className="mt-1.5 text-xs text-slate-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
