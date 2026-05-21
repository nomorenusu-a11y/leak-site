"use client";

import { useEffect, useState } from "react";
import { CategoryBadge } from "@/components/ui/CategoryBadge";
import { ScrollTime } from "@/components/ui/ScrollTime";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { ScrollItem } from "@/lib/live-board-scroll";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { RequestStatus } from "@/types/database";

type Props = {
  initial: ScrollItem[];
};

type LeakRequestRow = {
  id: string;
  masked_name: string;
  region: string | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  visible_on_board: boolean | null;
};

function ScrollRow({ item }: { item: ScrollItem }) {
  return (
    <li
      className="flex h-16 items-center gap-3 border-b border-slate-100 px-4 sm:px-5"
    >
      <CategoryBadge category={item.category} fallbackEtc />
      <div className="flex min-w-0 flex-1 items-center gap-2 text-sm">
        <span className="font-semibold text-slate-900">{item.masked_name || "고객"}</span>
        {item.region && (
          <>
            <span aria-hidden className="text-slate-300">·</span>
            <span className="truncate text-slate-500">{item.region}</span>
          </>
        )}
        <span aria-hidden className="text-slate-300">·</span>
        <span className="shrink-0 text-xs text-slate-400">
          <ScrollTime date={item.created_at} variant={item.time_variant} />
        </span>
      </div>
      <StatusBadge status={item.status} variant="solid" />
    </li>
  );
}

/**
 * 무한 세로 스크롤 보드.
 *
 * - 4행 viewport (h-64) + 상하 페이드 마스크
 * - CSS `liveBoardScroll` 키프레임으로 translateY(-50%) 까지 흐름
 * - track 내부에 [...items, ...items] 복제 → seamless loop
 * - Realtime INSERT 시 items 앞에 prepend → 다음 frame에 자연 합류
 * - prefers-reduced-motion: globals.css 글로벌 패치가 자동으로 정지시킴
 */
export function LiveBoardScrollClient({ initial }: Props) {
  const [items, setItems] = useState<ScrollItem[]>(initial);

  useEffect(() => {
    let supabase;
    try {
      supabase = createSupabaseBrowserClient();
    } catch {
      return;
    }
    const channel = supabase
      .channel("public:leak_requests:scroll")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leak_requests" },
        (payload) => {
          const row = payload.new as LeakRequestRow;
          if (row.visible_on_board === false) return;
          const newItem: ScrollItem = {
            id: row.id,
            masked_name: row.masked_name,
            region: row.region,
            status: row.status,
            created_at: row.created_at,
            updated_at: row.updated_at,
            time_variant: "relative",
          };
          setItems((prev) => [newItem, ...prev.filter((p) => p.id !== row.id)]);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "leak_requests" },
        (payload) => {
          const row = payload.new as LeakRequestRow;
          setItems((prev) => {
            if (row.visible_on_board === false) {
              return prev.filter((p) => p.id !== row.id);
            }
            const idx = prev.findIndex((p) => p.id === row.id);
            if (idx === -1) return prev;
            const next = [...prev];
            next[idx] = {
              ...next[idx],
              status: row.status,
              updated_at: row.updated_at,
            };
            return next;
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white py-10 text-center text-sm text-slate-500">
        작업이 등록되면 여기에 실시간으로 표시됩니다.
      </div>
    );
  }

  return (
    <div
      role="region"
      aria-label="실시간 작업 현황"
      className="live-board-mask overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <ul aria-live="off" className="live-board-track divide-y divide-slate-100">
        {items.map((it) => (
          <ScrollRow key={`a:${it.id}`} item={it} />
        ))}
        {items.map((it) => (
          <ScrollRow key={`b:${it.id}`} item={it} />
        ))}
      </ul>
    </div>
  );
}
