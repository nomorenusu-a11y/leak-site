import Link from "next/link";
import { Droplet } from "@/components/icons";
import { BUSINESS } from "@/lib/business";

/**
 * 사이트 로고 — Droplet SVG + 상호명. OS 이모지 💧 대신.
 */
export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const wrap = size === "sm" ? "size-7" : "size-8";
  const icon = size === "sm" ? 16 : 18;
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 font-extrabold text-brand-700 hover:text-brand-800"
      aria-label={`${BUSINESS.name} 홈으로`}
    >
      <span
        aria-hidden
        className={`inline-flex ${wrap} items-center justify-center rounded-md bg-brand-600 text-white`}
      >
        <Droplet size={icon} strokeWidth={2} />
      </span>
      <span className="tracking-tight">{BUSINESS.name}</span>
    </Link>
  );
}
