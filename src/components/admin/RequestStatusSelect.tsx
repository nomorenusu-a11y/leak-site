"use client";

import { useState, useTransition } from "react";
import { updateRequestStatus } from "@/app/admin/requests/actions";
import { STATUS_LABEL, STATUS_ORDER, type RequestStatus } from "@/types/database";

export function RequestStatusSelect({
  id,
  initial,
  size = "sm",
}: {
  id: string;
  initial: RequestStatus;
  size?: "sm" | "md";
}) {
  const [status, setStatus] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const cls =
    size === "md"
      ? "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900"
      : "rounded-md border border-slate-300 bg-white px-2 py-1 text-xs font-semibold text-slate-900";

  return (
    <div>
      <select
        value={status}
        disabled={pending}
        className={`${cls} disabled:cursor-not-allowed disabled:opacity-60`}
        onChange={(e) => {
          const next = e.target.value as RequestStatus;
          const prev = status;
          setStatus(next);
          setError(null);
          startTransition(async () => {
            const r = await updateRequestStatus(id, next);
            if (!r.ok) {
              setStatus(prev);
              setError(r.error);
            }
          });
        }}
      >
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABEL[s]}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}
