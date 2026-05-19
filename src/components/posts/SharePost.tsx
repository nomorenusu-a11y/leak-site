"use client";

import { useState } from "react";
import { Share2, Check } from "@/components/icons";

type Props = {
  url: string;
  title: string;
};

/**
 * 글 공유 — Web Share API(모바일) + URL 복사 fallback.
 * 카톡 직접 공유는 SDK 필요 — Web Share API가 카톡 등 OS 공유 시트를 열어주므로 별도 통합 불필요.
 */
export function SharePost({ url, title }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // 사용자가 cancel — fallthrough to copy
      }
    }
    // fallback: clipboard
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      aria-label="이 글 공유"
    >
      {copied ? (
        <>
          <Check aria-hidden className="size-4 text-emerald-600" strokeWidth={2.5} />
          링크 복사됨
        </>
      ) : (
        <>
          <Share2 aria-hidden className="size-4" strokeWidth={2} />
          공유
        </>
      )}
    </button>
  );
}
