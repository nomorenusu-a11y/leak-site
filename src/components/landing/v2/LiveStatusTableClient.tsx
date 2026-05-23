"use client";

import { useEffect, useRef, useState } from "react";
import type { ScrollItem } from "@/lib/live-board-scroll";
import type { RequestStatus } from "@/types/database";
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

const STATUS_FLOW: RequestStatus[] = ["pending", "quote", "active", "done"];

function advanceStatus(s: RequestStatus): RequestStatus {
  const i = STATUS_FLOW.indexOf(s);
  return i < STATUS_FLOW.length - 1 ? STATUS_FLOW[i + 1] : s;
}

export function LiveStatusTableClient({
  initial,
  rows = 5,
  intervalMs = 2_500,
}: Props) {
  const pool = useRef(initial);
  const cursor = useRef(rows % Math.max(initial.length, 1));
  const [visible, setVisible] = useState<ScrollItem[]>(() =>
    initial.slice(0, rows),
  );
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [changedRowId, setChangedRowId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);

  // Effect 1: 새 row 추가 (intervalMs 간격)
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
      setTimeout(() => setJustAddedId(null), 2000);
    }, intervalMs);
    return () => clearInterval(t);
  }, [paused, intervalMs, rows]);

  // Effect 2: 기존 row 상태 전진 (1.5초 간격) — 활발한 작업 진행 느낌
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      let picked: string | null = null;
      setVisible((prev) => {
        const candidates = prev.filter((item) => item.status !== "done");
        if (candidates.length === 0) return prev;
        const pick =
          candidates[Math.floor(Math.random() * candidates.length)];
        picked = pick.id;
        return prev.map((item) =>
          item.id === pick.id
            ? { ...item, status: advanceStatus(item.status) }
            : item,
        );
      });
      if (picked) {
        setChangedRowId(picked);
        setTimeout(() => setChangedRowId(null), 900);
      }
    }, 1500);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <div
      className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* 상단 LIVE 바 */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 px-4 py-2.5 sm:px-5">
        <span aria-hidden className="live-dot text-rose-500" />
        <span className="live-blink text-xs font-extrabold uppercase tracking-wider text-rose-700">
          LIVE
        </span>
        <span aria-hidden className="text-slate-300">·</span>
        <span className="text-xs font-semibold text-slate-700 sm:text-sm">
          지금도 작업 신청이 들어오고 있습니다
        </span>
      </div>

      {/* 행 */}
      <ul
        aria-live="polite"
        className="flex flex-1 flex-col divide-y divide-slate-100"
      >
        {visible.map((item) => {
          const isNew = item.id === justAddedId;
          const isChanged = item.id === changedRowId;
          return (
            <li
              key={item.id}
              data-just-added={isNew ? "true" : "false"}
              data-status-changed={isChanged ? "true" : "false"}
              className="flex flex-1 items-center"
            >
              <div className="grid w-full grid-cols-[1fr_auto] items-center gap-x-3 gap-y-1 px-4 py-1 sm:grid-cols-[6.5rem_7rem_1fr_1fr_7rem] sm:px-5">
                <span className="inline-flex w-fit items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-bold text-brand-700 sm:text-sm">
                  {toCategoryLabel(item.category)}
                  {isNew && (
                    <span className="live-new-pill ml-1 inline-flex items-center rounded-sm bg-rose-500 px-1 py-px text-[9px] font-black uppercase tracking-wider text-white">
                      NEW
                    </span>
                  )}
                </span>
                <div className="flex justify-end sm:hidden">
                  <StatusBadge status={item.status} />
                </div>
                <span className="hidden text-xs font-semibold text-slate-600 sm:block sm:text-sm">
                  <ScrollTime
                    date={item.created_at}
                    variant={item.time_variant}
                  />
                </span>
                <span className="col-span-2 truncate text-sm font-bold text-slate-900 sm:col-span-1">
                  {item.masked_name}
                  <span className="ml-2 text-xs font-normal text-slate-400 sm:hidden">
                    <ScrollTime
                      date={item.created_at}
                      variant={item.time_variant}
                    />
                  </span>
                </span>
                <span className="hidden truncate text-sm text-slate-500 sm:block">
                  {item.region ?? "—"}
                </span>
                <div className="hidden sm:flex sm:justify-end">
                  <StatusBadge status={item.status} />
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
