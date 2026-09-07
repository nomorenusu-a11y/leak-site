"use client";

import { useEffect, useState } from "react";
import { RelativeTime } from "@/components/ui/RelativeTime";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { LeakRequestBoardItem } from "@/types/database";

const MAX_ITEMS = 10;

type Props = {
  initial: LeakRequestBoardItem[];
};

type ItemWithFlag = LeakRequestBoardItem & { _justAdded?: boolean };

export function LiveBoardClient({ initial }: Props) {
  const [items, setItems] = useState<ItemWithFlag[]>(initial);

  useEffect(() => {
    let supabase: ReturnType<typeof createSupabaseBrowserClient>;
    try {
      supabase = createSupabaseBrowserClient();
    } catch {
      // 키가 설정 안 됐을 때는 조용히 종료 (초기 SSR 데이터만 노출).
      return;
    }
    // Public view cannot emit postgres_changes. Poll only its safe projection.
    // No subscription to the underlying customer table remains.
    let cancelled = false;
    let busy = false;
    async function refresh() {
      if (busy) return;
      busy = true;
      try {
        const { data, error } = await supabase
          .from("leak_request_board")
          .select("id, masked_name, region, status, created_at, updated_at")
          .order("created_at", { ascending: false })
          .limit(MAX_ITEMS);
        if (!cancelled && !error && data) setItems(data);
      } finally {
        busy = false;
      }
    }
    void refresh();
    const timer = setInterval(() => {
      void refresh();
    }, 15000);
    return () => {
      cancelled = true;
      clearInterval(timer);
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
