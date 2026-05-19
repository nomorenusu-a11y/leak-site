"use client";

import { useState, useTransition } from "react";
import { toggleBoardVisibility } from "@/app/admin/requests/actions";

export function BoardVisibilityToggle({
  id,
  initial,
}: {
  id: string;
  initial: boolean;
}) {
  const [visible, setVisible] = useState(initial);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-pressed={visible}
      onClick={() => {
        const next = !visible;
        const prev = visible;
        setVisible(next);
        startTransition(async () => {
          const r = await toggleBoardVisibility(id, next);
          if (!r.ok) setVisible(prev);
        });
      }}
      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-colors ${
        visible
          ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      } disabled:opacity-60`}
    >
      <span aria-hidden className={`size-1.5 rounded-full ${visible ? "bg-emerald-500" : "bg-slate-400"}`} />
      {visible ? "노출중" : "숨김"}
    </button>
  );
}
