"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RefreshCw, SearchCheck } from "lucide-react";

export function SearchVisibilityRefresh() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState(
    "방문 통계를 새로 불러오고 공개 글을 순서대로 점검합니다. 예약 글은 열지 않습니다.",
  );

  function refresh() {
    startTransition(async () => {
      try {
        const response = await fetch("/admin/api/search-visibility", { method: "POST" });
        const body = await response.text();
        const result = (body ? JSON.parse(body) : {}) as {
          ok?: boolean;
          visibleCount?: number;
          errorCount?: number;
          error?: string;
          pagesChecked?: number;
          searchChecked?: number;
          cooldownUntil?: string;
        };
        if (!response.ok || !result.ok) {
          throw new Error(result.error || "네이버 검색 결과를 확인하지 못했습니다.");
        }
        const suffix = result.errorCount ? ` · 오류 ${result.errorCount}개` : "";
        setMessage(
          `공개 글 ${result.pagesChecked ?? 0}개 접속 확인 · 검색 ${result.searchChecked ?? 0}개 확인${suffix}.${result.cooldownUntil && Date.parse(result.cooldownUntil) > Date.now() ? " 네이버 요청 제한으로 검색 검사를 잠시 쉽니다. 접속·방문 통계는 계속 확인합니다." : ""}`,
        );
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "업데이트에 실패했습니다.");
      }
    });
  }

  return (
    <div className="flex flex-col items-start gap-2 sm:items-end">
      <button
        type="button"
        onClick={refresh}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? <RefreshCw size={17} className="animate-spin" /> : <SearchCheck size={17} />}
        {pending ? "통계 확인 중..." : "통계·노출 업데이트"}
      </button>
      <p
        className="max-w-md text-left text-xs leading-5 text-slate-500 sm:text-right"
        role="status"
      >
        {message}
      </p>
    </div>
  );
}
