"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { updateRequestMemo } from "@/app/admin/requests/actions";

export function AdminMemoField({ id, initial }: { id: string; initial: string }) {
  const [value, setValue] = useState(initial);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const debounceRef = useRef<number | null>(null);
  const lastSavedRef = useRef<string>(initial);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function scheduleSave(next: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      if (next === lastSavedRef.current) return;
      startTransition(async () => {
        const r = await updateRequestMemo(id, next);
        if (r.ok) {
          lastSavedRef.current = next;
          setSavedAt(Date.now());
          setError(null);
        } else {
          setError(r.error);
        }
      });
    }, 800);
  }

  return (
    <div>
      <label htmlFor={`memo-${id}`} className="mb-1.5 flex items-baseline justify-between text-sm font-bold text-slate-800">
        <span>관리자 메모</span>
        <span className="text-xs font-normal text-slate-500">
          {pending && "저장 중..."}
          {!pending && savedAt && "저장됨"}
          {error && <span className="text-red-600">{error}</span>}
        </span>
      </label>
      <textarea
        id={`memo-${id}`}
        value={value}
        rows={5}
        maxLength={2000}
        onChange={(e) => {
          setValue(e.target.value);
          scheduleSave(e.target.value);
        }}
        placeholder="현장 메모, 일정 협의 내용, 인수인계 등을 자유롭게 적으세요."
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
    </div>
  );
}
