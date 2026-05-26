"use client";

import { useState } from "react";

export function LoginForm({ from, error }: { from?: string; error?: string }) {
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      action="/admin/api/login"
      method="POST"
      onSubmit={() => setSubmitting(true)}
      className="space-y-3"
      noValidate
    >
      {from && <input type="hidden" name="from" defaultValue={from} />}
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-bold text-slate-800">
          비밀번호
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          autoComplete="current-password"
          className={`w-full rounded-lg border ${error ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"} px-3.5 py-2.5 text-base text-slate-900 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200`}
        />
        {error && <p className="mt-1.5 text-xs font-semibold text-red-600">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center rounded-lg bg-brand-600 px-4 py-2.5 text-base font-bold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {submitting ? "확인 중..." : "로그인"}
      </button>
    </form>
  );
}
