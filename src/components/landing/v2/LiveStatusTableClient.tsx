"use client";

import { useEffect, useRef, useState } from "react";
import type { ScrollItem } from "@/lib/live-board-scroll";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ScrollTime } from "@/components/ui/ScrollTime";

type Props = {
  initial: ScrollItem[];
  rows?: number;
  intervalMs?: number;
};

const CATEGORY_KO: Record<string, string> = {
  leak: "누수",
  toilet: "변기",
  sink: "싱크대",
  heating: "난방",
  frozen: "동파",
};

function toCategoryLabel(cat: string | null | undefined): string {
  if (!cat) return "기타";
  return CATEGORY_KO[cat] ?? cat;
}

/**
 * 실시간 견적현황 테이블.
 *
 * - 일정 간격으로 새 row가 맨 위에 추가 + yellow flash 강조 (board-row-in)
 * - 첫 row에 "NEW" pill 2초 페이드 + 좌측 막대 강조
 * - 상단 "오늘 신규 접수" 카운터 — row 추가 시 +1 펄스
 */
export function LiveStatusTableClient({
  initial,
  rows = 5,
  intervalMs = 5_500,
}: Props) {
  const pool = useRef(initial);
  const cursor = useRef(rows % Math.max(initial.length, 1));
  const [visible, setVisible] = useState<ScrollItem[]>(() =>
    initial.slice(0, rows),
  );
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [todayCount, setTodayCount] = useState(initial.length);
  const [counterPulse, setCounterPulse] = useState(false);

  useEffect(() => {
    if (paused || pool.current.length === 0) return;
    const t = setInterval(() => {
      const idx = cursor.current % pool.current.length;
      const candidate = pool.current[idx];
      cursor.current = idx + 1;
      const fresh: ScrollItem = {
        ...candidate,
        id: `${candidate.id}-${Date.now()}`,
        created_at: new Date().toISOString(),
        status: "pending",
        time_variant: "relative",
      };
      setJustAddedId(fresh.id);
      setVisible((prev) => [fresh, ...prev].slice(0, rows));
      setTodayCount((c) => c + 1);
      setCounterPulse(true);
      setTimeout(() => setCounterPulse(false), 500);
      // NEW pill 페이드: 2s 후 강조 해제
      setTimeout(() => setJustAddedId(null), 2000);
    }, intervalMs);
    return () => clearInterval(t);
  }, [paused, intervalMs, rows]);

  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* 상단 카운터 바 — "지금 N건 접수 중" */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 px-4 py-2.5 sm:px-5">
        <div className="flex items-center gap-2">
          <span aria-hidden className="live-dot text-rose-500" />
          <span className="live-blink text-xs font-extrabold uppercase tracking-wider text-rose-700">
            LIVE
          </span>
          <span aria-hidden className="text-slate-300">·</span>
          <span className="text-xs font-semibold text-slate-700 sm:text-sm">
            지금도 작업 신청이 들어오고 있습니다
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs sm:text-sm">
          <span className="text-slate-500">오늘 누적</span>
          <span
            className={`inline-block min-w-[2.5rem] rounded-md bg-rose-500 px-2 py-0.5 text-center text-xs font-black text-white sm:text-sm ${
              counterPulse ? "live-counter-pulse" : ""
            }`}
          >
            {todayCount}건
          </span>
        </div>
      </div>

      {/* 컬럼 헤더 (sm+) */}
      <div className="hidden border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 sm:grid sm:grid-cols-[6.5rem_7rem_1fr_1fr_7rem] sm:items-center sm:gap-3 sm:px-5">
        <span>카테고리</span>
        <span>접수 시간</span>
        <span>고객</span>
        <span>지역</span>
        <span className="text-right">상태</span>
      </div>

      <ul aria-live="polite" className="divide-y divide-slate-100">
        {visible.map((item) => {
          const isNew = item.id === justAddedId;
          return (
            <li
              key={item.id}
              data-just-added={isNew ? "true" : "false"}
              className="grid grid-cols-2 items-center gap-2 px-4 py-3 text-sm sm:grid-cols-[6.5rem_7rem_1fr_1fr_7rem] sm:gap-3 sm:px-5 sm:py-3.5"
            >
              <span className="inline-flex w-fit items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-700 sm:text-xs">
                {toCategoryLabel(item.category)}
                {isNew && (
                  <span className="live-new-pill ml-1 inline-flex items-center rounded-sm bg-rose-500 px-1 py-px text-[9px] font-black uppercase tracking-wider text-white">
                    NEW
                  </span>
                )}
              </span>
              <span className="text-right text-[11px] font-semibold text-slate-600 sm:text-left sm:text-xs">
                <ScrollTime
                  date={item.created_at}
                  variant={item.time_variant}
                />
              </span>
              <span className="col-span-1 truncate font-bold text-slate-900 sm:col-span-1">
                {item.masked_name}
              </span>
              <span className="col-span-1 truncate text-xs text-slate-500 sm:col-span-1 sm:text-sm">
                {item.region ?? "—"}
              </span>
              <div className="col-span-2 flex justify-end sm:col-span-1">
                <StatusBadge status={item.status} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
