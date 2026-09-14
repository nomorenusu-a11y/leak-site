"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus } from "lucide-react";

export function ScheduleWeekButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  function schedule() {
    setMessage("");
    startTransition(async () => {
      try {
        const response = await fetch("/admin/api/schedule-week", { method: "POST" });
        const result = await response.json() as { ok: boolean; created?: unknown[]; error?: string };
        if (!response.ok || !result.ok) throw new Error(result.error || "예약 생성에 실패했습니다.");
        setMessage(`이번 주 ${(result.created ?? []).length}개 글을 캘린더에 배치했습니다.`);
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "예약 생성에 실패했습니다.");
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button type="button" onClick={schedule} disabled={pending} className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/30 hover:bg-blue-400 disabled:cursor-wait disabled:bg-slate-600">
        <CalendarPlus size={17} /> {pending ? "49개 글을 배치하는 중..." : "이번 주 49개 예약 채우기"}
      </button>
      {message && <p className="max-w-sm text-right text-xs leading-5 text-slate-400" role="status">{message}</p>}
    </div>
  );
}
