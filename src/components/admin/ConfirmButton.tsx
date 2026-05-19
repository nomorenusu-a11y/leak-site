"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Result = { ok: true } | { ok: false; error: string };

export function ConfirmButton({
  label,
  confirmMessage,
  onAction,
  redirectTo,
  variant = "danger",
}: {
  label: string;
  confirmMessage: string;
  onAction: () => Promise<Result>;
  redirectTo?: string;
  variant?: "danger" | "neutral";
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const base = "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-bold transition-colors disabled:opacity-60";
  const cls =
    variant === "danger"
      ? `${base} bg-red-600 text-white hover:bg-red-700`
      : `${base} bg-slate-200 text-slate-800 hover:bg-slate-300`;

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        className={cls}
        onClick={() => {
          if (!confirm(confirmMessage)) return;
          setError(null);
          startTransition(async () => {
            const r = await onAction();
            if (!r.ok) {
              setError(r.error);
              return;
            }
            if (redirectTo) router.push(redirectTo);
            else router.refresh();
          });
        }}
      >
        {pending ? "처리 중..." : label}
      </button>
      {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}
