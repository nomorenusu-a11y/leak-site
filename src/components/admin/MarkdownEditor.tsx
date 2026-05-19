"use client";

import { useState } from "react";
import { PostBody } from "@/components/posts/PostBody";

export function MarkdownEditor({
  value,
  onChange,
  error,
}: {
  value: string;
  onChange: (next: string) => void;
  error?: string;
}) {
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

  const editor = (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={20}
      placeholder="# 제목&#10;&#10;본문은 Markdown으로 작성하세요."
      className={`block w-full resize-y rounded-lg border ${
        error ? "border-red-400 bg-red-50" : "border-slate-300 bg-white"
      } p-3 font-mono text-sm leading-relaxed text-slate-900 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200`}
    />
  );

  const preview = (
    <div className="min-h-[20rem] rounded-lg border border-slate-200 bg-slate-50 p-4">
      {value.trim() ? (
        <PostBody content={value} />
      ) : (
        <p className="text-sm text-slate-400">미리보기가 여기에 표시됩니다.</p>
      )}
    </div>
  );

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-bold text-slate-800">본문 (Markdown)</span>
        <div className="md:hidden">
          <button
            type="button"
            onClick={() => setMobileTab("edit")}
            className={`rounded-l-md border px-2.5 py-1 text-xs font-semibold ${mobileTab === "edit" ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-slate-700"}`}
          >
            편집
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("preview")}
            className={`rounded-r-md border-y border-r px-2.5 py-1 text-xs font-semibold ${mobileTab === "preview" ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-slate-700"}`}
          >
            미리보기
          </button>
        </div>
      </div>
      {/* desktop: split */}
      <div className="hidden md:grid md:grid-cols-2 md:gap-3">
        {editor}
        {preview}
      </div>
      {/* mobile: tab */}
      <div className="md:hidden">{mobileTab === "edit" ? editor : preview}</div>
      {error && <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>}
    </div>
  );
}
