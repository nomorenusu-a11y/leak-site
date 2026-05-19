"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * 글로벌 에러 boundary. Server Component·Client Component에서 throw된 에러를 캐치.
 * 민감 정보 노출 방지: digest만 표시. stack/message는 production에서 숨김.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // production에서는 console.log 제거되지만 console.error는 유지
    console.error("[error.tsx]", error);
  }, [error]);

  const isDev = process.env.NODE_ENV !== "production";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-20">
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-4xl" aria-hidden>
          😅
        </p>
        <h1 className="mt-3 text-xl font-extrabold text-slate-900 sm:text-2xl">
          잠시 후 다시 시도해 주세요.
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          일시적인 문제가 생겼어요. 새로고침해도 안 되면 전화로 알려주세요.
        </p>
        {error.digest && (
          <p className="mt-3 font-mono text-xs text-slate-400">
            오류 ID: {error.digest}
          </p>
        )}
        {isDev && (
          <pre className="mt-4 overflow-auto rounded-md bg-slate-100 p-3 text-left text-xs text-slate-700">
            {error.message}
            {"\n"}
            {error.stack?.slice(0, 600)}
          </pre>
        )}
        <div className="mt-6 flex flex-col items-center gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex w-full items-center justify-center rounded-lg bg-brand-600 px-5 py-2.5 font-bold text-white shadow-sm hover:bg-brand-700 sm:w-auto"
          >
            다시 시도
          </button>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 font-bold text-slate-800 hover:bg-slate-50 sm:w-auto"
          >
            홈으로
          </Link>
        </div>
      </div>
    </main>
  );
}
