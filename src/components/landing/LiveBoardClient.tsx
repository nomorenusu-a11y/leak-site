"use client";

import { useEffect, useState } from "react";
import { RelativeTime } from "@/components/ui/RelativeTime";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { LeakRequestBoardItem, RequestStatus } from "@/types/database";

const MAX_ITEMS = 10;

type Props = {
  initial: LeakRequestBoardItem[];
};

type ItemWithFlag = LeakRequestBoardItem & { _justAdded?: boolean };

type LeakRequestRow = {
  id: string;
  masked_name: string;
  region: string | null;
  status: RequestStatus;
  created_at: string;
  updated_at: string;
  visible_on_board: boolean | null;
};

function toBoardItem(row: LeakRequestRow): LeakRequestBoardItem {
  return {
    id: row.id,
    masked_name: row.masked_name,
    region: row.region,
    status: row.status,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

export function LiveBoardClient({ initial }: Props) {
  const [items, setItems] = useState<ItemWithFlag[]>(initial);

  useEffect(() => {
    let supabase;
    try {
      supabase = createSupabaseBrowserClient();
    } catch {
      // 키가 설정 안 됐을 때는 조용히 종료 (초기 SSR 데이터만 노출).
      return;
    }
    const channel = supabase
      .channel("public:leak_requests:board")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "leak_requests" },
        (payload) => {
          const row = payload.new as LeakRequestRow;
          if (row.visible_on_board === false) return;
          const newItem: ItemWithFlag = { ...toBoardItem(row), _justAdded: true };
          setItems((prev) => [newItem, ...prev.filter((p) => p.id !== row.id)].slice(0, MAX_ITEMS));
          // 1.2초 후 플래그 해제 (애니메이션 1회용)
          setTimeout(() => {
            setItems((prev) =>
              prev.map((p) => (p.id === row.id ? { ...p, _justAdded: false } : p)),
            );
          }, 1200);
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
            if (idx === -1) {
              return [toBoardItem(row), ...prev].slice(0, MAX_ITEMS);
            }
            const next = [...prev];
            next[idx] = { ...toBoardItem(row), _justAdded: false };
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
    <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {items.map((it) => (
        <li
          key={it.id}
          data-just-added={it._justAdded ? "true" : "false"}
          className="flex items-center gap-3 px-4 py-3 sm:px-5"
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <span className="truncate">{it.masked_name || "고객"}</span>
              {it.region && (
                <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600">
                  {it.region}
                </span>
              )}
            </div>
            <div className="mt-0.5 text-xs text-slate-500">
              <RelativeTime date={it.created_at} />
            </div>
          </div>
          <StatusBadge status={it.status} />
        </li>
      ))}
    </ul>
  );
}
