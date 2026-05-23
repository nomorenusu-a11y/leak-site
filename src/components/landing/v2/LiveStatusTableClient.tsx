"use client";

import { useEffect, useRef, useState } from "react";
import type { ScrollItem } from "@/lib/live-board-scroll";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ScrollTime } from "@/components/ui/ScrollTime";

type Props = {
  initial: ScrollItem[];
  /** 보여줄 row 개수 (기본 12) */
  rows?: number;
  /** 새 row 추가 간격 (기본 12초) */
  intervalMs?: number;
};

/**
 * 실시간 견적현황 테이블 (LiveStatusTable).
 *
 * 컬럼: 카테고리 / 시간 / 이름 / 지역 / 상태
 * 동작: 일정 간격으로 풀에서 다음 아이템을 맨 위에 추가, 가장 오래된 row는 제거.
 *       data-just-added로 부드러운 fade-in (board-row-in keyframe).
 *
 * 사용자가 직접 탭 포커스/마우스 hover 중일 때는 일시 정지(접근성).
 */
export function LiveStatusTableClient({
  initial,
  rows = 12,
  intervalMs = 12_000,
}: Props) {
  const pool = useRef(initial);
  const cursor = useRef(rows % Math.max(initial.length, 1));
  const [visible, setVisible] = useState<ScrollItem[]>(() =>
    initial.slice(0, rows),
  );
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (pool.current.length === 0) return;
    const t = setInterval(() => {
      const idx = cursor.current % pool.current.length;
      const candidate = pool.current[idx];
      cursor.current = idx + 1;
      // 가짜로 created_at을 "지금"으로 갱신해 자연스럽게
      const fresh: ScrollItem = {
        ...candidate,
        id: `${candidate.id}-${Date.now()}`,
        created_at: new Date().toISOString(),
        status: "pending",
        time_variant: "relative",
      };
      setJustAddedId(fresh.id);
      setVisible((prev) => [fresh, ...prev].slice(0, rows));
      // 다음 tick에 강조 해제
      setTimeout(() => setJustAddedId(null), 400);
    }, intervalMs);
    return () => clearInterval(t);
  }, [paused, intervalMs, rows]);

  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* 헤더 (sm+) */}
      <div className="hidden border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 sm:grid sm:grid-cols-[7rem_8rem_1fr_1fr_8rem] sm:items-center sm:gap-3 sm:px-5">
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
              className="grid grid-cols-2 items-center gap-2 px-4 py-3 text-sm sm:grid-cols-[7rem_8rem_1fr_1fr_8rem] sm:gap-3 sm:px-5 sm:py-3.5"
            >
              {/* 카테고리 */}
              <span className="inline-flex w-fit items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-[11px] font-bold text-brand-700 sm:text-xs">
                {item.category ?? "기타"}
              </span>
              {/* 시간 — 모바일에서 카테고리 옆 작게 */}
              <span className="text-right text-[11px] text-slate-500 sm:text-left sm:text-xs">
                <ScrollTime
                  date={item.created_at}
                  variant={item.time_variant}
                />
              </span>
              {/* 이름 */}
              <span className="col-span-1 truncate font-bold text-slate-900 sm:col-span-1">
                {item.masked_name}
              </span>
              {/* 지역 */}
              <span className="col-span-1 truncate text-xs text-slate-500 sm:col-span-1 sm:text-sm">
                {item.region ?? "—"}
              </span>
              {/* 상태 */}
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
