"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { RefreshCw, SearchCheck } from "lucide-react";

function todayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function IndexNowSync() {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("최근 공개 글을 네이버에 자동으로 알립니다.");

  const sync = useCallback((automatic = false) => {
    startTransition(async () => {
      try {
        const response = await fetch("/admin/api/indexnow", { method: "POST" });
        const result = (await response.json()) as {
          ok: boolean;
          submitted?: number;
          error?: string;
        };
        if (!response.ok || !result.ok)
          throw new Error(result.error || "네이버 알림에 실패했습니다.");
        localStorage.setItem("indexnow:last-sync", todayKey());
        setMessage(`최근 공개 글 ${result.submitted ?? 0}개를 검색엔진에 알렸습니다.`);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "네이버 알림에 실패했습니다.");
        if (automatic) localStorage.removeItem("indexnow:last-sync");
      }
    });
  }, []);

  useEffect(() => {
    if (localStorage.getItem("indexnow:last-sync") !== todayKey()) sync(true);
  }, [sync]);

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={() => sync(false)}
        disabled={pending}
        className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-4 py-3 text-sm font-bold text-emerald-200 transition hover:bg-emerald-400/15 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? <RefreshCw size={17} className="animate-spin" /> : <SearchCheck size={17} />}
        {pending ? "검색엔진에 알리는 중..." : "네이버 새 글 알림"}
      </button>
      <p className="max-w-sm text-right text-xs leading-5 text-slate-500" role="status">
        {message}
      </p>
    </div>
  );
}
