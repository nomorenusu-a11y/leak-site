"use client";

import { useActionState } from "react";

type TestResult = { ok: boolean; message: string } | null;
type TestAction = (previous: TestResult, formData: FormData) => Promise<TestResult>;

export function KakaoTestForm({ action }: { action: TestAction }) {
  const [result, formAction, pending] = useActionState(action, null);

  return <form action={formAction} className="flex flex-wrap items-center gap-3">
    <button disabled={pending} className="rounded-xl border border-white/15 px-5 py-3 text-sm font-bold text-white hover:bg-white/[.06] disabled:cursor-wait disabled:opacity-60">
      {pending ? "테스트 발송 중…" : "테스트 알림 보내기"}
    </button>
    {result && <p className={`text-sm font-semibold ${result.ok ? "text-emerald-300" : "text-rose-300"}`}>{result.message}</p>}
  </form>;
}
