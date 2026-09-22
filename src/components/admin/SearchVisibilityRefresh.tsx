"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { RefreshCw, SearchCheck } from "lucide-react";

export function SearchVisibilityRefresh() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState(
    "버튼을 누를 때만 주요 키워드의 현재 네이버 검색 결과를 확인합니다.",
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
        };
        if (!response.ok || !result.ok) {
          throw new Error(result.error || "네이버 검색 결과를 확인하지 못했습니다.");
        }
        const suffix = result.errorCount ? ` · 오류 ${result.errorCount}개` : "";
        setMessage(
          `주요 검색어 중 ${result.visibleCount ?? 0}개에서 노출을 확인했습니다${suffix}.`,
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
        {pending ? "네이버 확인 중..." : "현재 검색 결과 업데이트"}
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
