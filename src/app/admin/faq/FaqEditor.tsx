"use client";

import { useState, useTransition } from "react";
import type { FaqItemData } from "@/types/database";
import { saveFaqItems } from "./actions";

type Status = "idle" | "saving" | "saved" | "error";

export function FaqEditor({ items: initialItems }: { items: FaqItemData[] }) {
  const [items, setItems] = useState<FaqItemData[]>(initialItems);
  const [status, setStatus] = useState<Status>("idle");
  const [isPending, startTransition] = useTransition();

  /* ── helpers ─────────────────────────────────── */

  function updateItem(index: number, field: keyof FaqItemData, value: string) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
    if (status === "saved") setStatus("idle");
  }

  function addItem() {
    setItems((prev) => [...prev, { question: "", answer: "" }]);
    if (status === "saved") setStatus("idle");
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
    if (status === "saved") setStatus("idle");
  }

  function moveItem(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    if (status === "saved") setStatus("idle");
  }

  function handleSave() {
    setStatus("saving");
    startTransition(async () => {
      try {
        await saveFaqItems(items);
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    });
  }

  /* ── render ──────────────────────────────────── */

  return (
    <div className="space-y-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 bg-white p-4"
        >
          {/* card header */}
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-700">Q{i + 1}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveItem(i, -1)}
                disabled={i === 0}
                className="text-sm text-slate-400 hover:text-slate-600 px-1 disabled:opacity-30"
                aria-label="위로 이동"
              >
                ▲
              </button>
              <button
                type="button"
                onClick={() => moveItem(i, 1)}
                disabled={i === items.length - 1}
                className="text-sm text-slate-400 hover:text-slate-600 px-1 disabled:opacity-30"
                aria-label="아래로 이동"
              >
                ▼
              </button>
              <button
                type="button"
                onClick={() => removeItem(i)}
                className="ml-2 text-sm text-red-600 hover:text-red-800"
                aria-label="삭제"
              >
                삭제
              </button>
            </div>
          </div>

          {/* question */}
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            질문
          </label>
          <input
            type="text"
            value={item.question}
            onChange={(e) => updateItem(i, "question", e.target.value)}
            placeholder="질문을 입력하세요"
            className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />

          {/* answer */}
          <label className="mb-1 block text-xs font-semibold text-slate-600">
            답변
          </label>
          <textarea
            rows={3}
            value={item.answer}
            onChange={(e) => updateItem(i, "answer", e.target.value)}
            placeholder="답변을 입력하세요"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
          />
        </div>
      ))}

      {/* action buttons */}
      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="button"
          onClick={addItem}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          질문 추가
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {isPending ? "저장 중..." : "저장"}
        </button>

        {status === "saved" && (
          <span className="text-sm text-emerald-600 font-medium">
            저장되었습니다.
          </span>
        )}
        {status === "error" && (
          <span className="text-sm text-red-600 font-medium">
            저장에 실패했습니다.
          </span>
        )}
      </div>
    </div>
  );
}
