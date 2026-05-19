import type { ReactNode } from "react";

type Variant = "neutral" | "info" | "warning" | "active" | "success" | "danger";
type Size = "sm" | "md";

const VARIANT: Record<Variant, string> = {
  neutral: "bg-slate-100 text-slate-700",
  info: "bg-info-bg text-info",
  warning: "bg-warning-bg text-warning",
  active: "bg-accent-50 text-accent-700",
  success: "bg-success-bg text-success",
  danger: "bg-danger-bg text-danger",
};

const SIZE: Record<Size, string> = {
  sm: "rounded-full px-2 py-0.5 text-[11px]",
  md: "rounded-full px-2.5 py-1 text-xs",
};

/**
 * 디자인 토큰 기반 뱃지. 색 + 아이콘 조합으로 색맹 접근성 ↑.
 */
export function Badge({
  variant = "neutral",
  size = "md",
  icon,
  children,
  className = "",
}: {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold ${VARIANT[variant]} ${SIZE[size]} ${className}`}
    >
      {icon}
      {children}
    </span>
  );
}
