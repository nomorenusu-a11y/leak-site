import { forwardRef, type TextareaHTMLAttributes } from "react";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  invalid?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  { className = "", invalid, ...rest },
  ref,
) {
  return (
    <textarea
      ref={ref}
      {...rest}
      className={`block w-full resize-y rounded-lg border bg-white px-3.5 py-2.5 text-base text-slate-900 transition-colors placeholder:text-slate-500 focus:outline-none focus:ring-2 disabled:bg-slate-100 disabled:opacity-60 ${
        invalid
          ? "border-danger bg-danger-bg/40 focus:border-danger focus:ring-danger/30"
          : "border-input-border focus:border-input-border-focus focus:ring-brand-200"
      } ${className}`}
    />
  );
});
