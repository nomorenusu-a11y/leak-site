import { forwardRef, type InputHTMLAttributes } from "react";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
};

/**
 * 디자인 토큰 기반 input. invalid=true면 border/bg가 위험 톤으로.
 * `aria-invalid`도 함께 설정 권장 (Field 컴포넌트가 자동 처리).
 */
export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className = "", invalid, ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      {...rest}
      className={`block w-full rounded-lg border bg-white px-3.5 py-2.5 text-base text-slate-900 transition-colors placeholder:text-slate-500 focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:opacity-60 ${
        invalid
          ? "border-danger bg-danger-bg/40 focus:border-danger focus:ring-danger/30"
          : "border-input-border focus:border-input-border-focus focus:ring-brand-200"
      } ${className}`}
    />
  );
});
