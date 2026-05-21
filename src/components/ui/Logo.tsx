import Image from "next/image";
import Link from "next/link";
import { BUSINESS } from "@/lib/business";

type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, { img: number; text: string }> = {
  sm: { img: 32, text: "text-sm" },
  md: { img: 48, text: "text-base" },
  lg: { img: 64, text: "text-xl" },
};

/**
 * 사이트 로고 — Image + 상호명.
 *
 * @param size  헤더(md) / 푸터(sm) / 랜딩 강조(lg)
 * @param textClass  텍스트 색·강조 변형 (어두운 배경에선 brand-300 등)
 * @param hideTextOnMobile  모바일에서 텍스트만 숨김 (로고 이미지는 노출)
 */
export function Logo({
  size = "md",
  textClass = "text-brand-700",
  hideTextOnMobile = false,
}: {
  size?: Size;
  textClass?: string;
  hideTextOnMobile?: boolean;
}) {
  const s = SIZES[size];
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2"
      aria-label={`${BUSINESS.name} 홈으로`}
    >
      <Image
        src="/logo.png"
        alt=""
        width={s.img}
        height={s.img}
        priority
        className="rounded-md"
      />
      <span
        className={`font-extrabold tracking-tight ${s.text} ${textClass} ${hideTextOnMobile ? "hidden sm:inline" : ""}`}
      >
        {BUSINESS.name}
      </span>
    </Link>
  );
}
