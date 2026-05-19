import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "@/components/icons";

type Variant = "primary" | "secondary" | "accent" | "ghost" | "outline" | "tel";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60";

const VARIANT: Record<Variant, string> = {
  // Primary: 사이트 전역에서 가장 강한 액션 (폼 Submit, Hero CTA 등)
  primary:
    "bg-brand-600 text-white shadow-md shadow-brand-600/20 hover:bg-brand-700 focus-visible:ring-brand-500",
  // Secondary: 두 번째 액션 (예: "다른 사례 보기")
  secondary:
    "bg-white text-brand-700 border-2 border-brand-200 hover:bg-brand-50 focus-visible:ring-brand-300",
  // Accent: 긴급 전화 통화 단 한 용도. 폼·Hero에서 사용 금지.
  accent:
    "bg-accent-500 text-white shadow-md shadow-accent-500/30 hover:bg-accent-600 focus-visible:ring-accent-400",
  // Ghost: 텍스트만, 보조 링크
  ghost: "text-brand-700 hover:bg-brand-50 focus-visible:ring-brand-300",
  // Outline: 어두운 배경 위 (Hero 등)
  outline:
    "border-2 border-white/50 text-white hover:bg-white/10 focus-visible:ring-white/60",
  // Tel: 카카오톡 노랑 — 한정 용도
  tel: "bg-[#FEE500] text-[#191600] shadow-md hover:brightness-95 focus-visible:ring-yellow-300",
};

const SIZE: Record<Size, string> = {
  sm: "min-h-[36px] px-3 py-1.5 text-sm",
  md: "min-h-[44px] px-4 py-2 text-sm",
  lg: "min-h-[48px] px-5 py-2.5 text-base",
};

type CommonProps = {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  block?: boolean;
  icon?: ReactNode;
  children: ReactNode;
};

type ButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "children"> & {
    type?: "button" | "submit" | "reset";
  };

type LinkProps = CommonProps & {
  href: string;
  external?: boolean;
  /** anchor attributes — onClick 등 */
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "children">;

function classes(variant: Variant, size: Size, block?: boolean, className?: string) {
  return `${BASE} ${VARIANT[variant]} ${SIZE[size]} ${block ? "w-full" : ""} ${className ?? ""}`;
}

export function Button({
  variant = "primary",
  size = "lg",
  loading = false,
  block = false,
  icon,
  children,
  className,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={classes(variant, size, block, className)}
    >
      {loading ? <Loader2 aria-hidden className="size-4 animate-spin" /> : icon}
      <span>{children}</span>
    </button>
  );
}

/**
 * 같은 디자인 토큰의 Link 버전. 내부 라우트는 next/link, 외부는 raw <a>.
 */
export function ButtonLink({
  variant = "primary",
  size = "lg",
  block = false,
  icon,
  children,
  className,
  href,
  external,
  ...rest
}: LinkProps) {
  const cls = classes(variant, size, block, className);
  if (external || /^https?:|^tel:|^mailto:/.test(href)) {
    return (
      <a
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener" : undefined}
        className={cls}
        {...rest}
      >
        {icon}
        <span>{children}</span>
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {icon}
      <span>{children}</span>
    </Link>
  );
}
