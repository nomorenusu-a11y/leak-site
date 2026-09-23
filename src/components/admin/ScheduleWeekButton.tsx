"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus } from "lucide-react";

type Campaign = "september" | "october-pilot";

export function ScheduleWeekButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [pendingCampaign, setPendingCampaign] = useState<Campaign | null>(null);
  const [message, setMessage] = useState("");

  function schedule(campaign: Campaign) {
    setMessage("");
    setPendingCampaign(campaign);
    startTransition(async () => {
      try {
        const response = await fetch("/admin/api/schedule-week", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ campaign }),
        });
        const result = (await response.json()) as {
          ok: boolean;
          startDate?: string;
          endDate?: string;
          created?: unknown[];
          error?: string;
        };
        if (!response.ok || !result.ok) {
          throw new Error(result.error || "예약 생성에 실패했습니다.");
        }
        setMessage(
          `${result.startDate}~${result.endDate} 예약 ${(result.created ?? []).length}개를 캘린더에 배치했습니다.`,
        );
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "예약 생성에 실패했습니다.");
      } finally {
        setPendingCampaign(null);
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          onClick={() => schedule("september")}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm font-bold text-slate-100 hover:bg-slate-700 disabled:cursor-wait disabled:bg-slate-700"
        >
          <CalendarPlus size={17} />
          {pendingCampaign === "september" ? "9월 예약 정리 중..." : "남은 9월 예약 채우기"}
        </button>
        <button
          type="button"
          onClick={() => schedule("october-pilot")}
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-950/30 hover:bg-blue-400 disabled:cursor-wait disabled:bg-slate-600"
        >
          <CalendarPlus size={17} />
          {pendingCampaign === "october-pilot"
            ? "10월 1~5일 예약 생성 중..."
            : "10월 1~5일 하루 10~12개 예약"}
        </button>
      </div>
      {message && (
        <p className="max-w-xl text-right text-xs leading-5 text-slate-400" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
