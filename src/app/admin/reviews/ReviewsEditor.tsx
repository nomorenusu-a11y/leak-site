"use client";

import { useState, useTransition } from "react";
import { saveTestimonials } from "./actions";
import type { TestimonialData } from "@/types/database";

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "leak", label: "누수탐지" },
  { value: "toilet", label: "변기" },
  { value: "sink", label: "싱크대" },
  { value: "heating", label: "난방" },
  { value: "frozen", label: "동파" },
];

function blankItem(): TestimonialData {
  return { author: "", region: "", category: "leak", ko: "", body: "" };
}

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function ReviewsEditor({ items: initial }: { items: TestimonialData[] }) {
  const [items, setItems] = useState<TestimonialData[]>(initial);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [isPending, startTransition] = useTransition();

  /* ---- field update ---- */
  function update(index: number, field: keyof TestimonialData, value: string) {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, [field]: value } : it)));
    if (status === "saved") setStatus("idle");
  }

  /* ---- reorder ---- */
  function moveUp(index: number) {
    if (index === 0) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
    if (status === "saved") setStatus("idle");
  }

  function moveDown(index: number) {
    if (index === items.length - 1) return;
    setItems((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
    if (status === "saved") setStatus("idle");
  }

  /* ---- add / delete ---- */
  function addItem() {
    setItems((prev) => [...prev, blankItem()]);
    if (status === "saved") setStatus("idle");
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
    if (status === "saved") setStatus("idle");
  }

  /* ---- save ---- */
  function handleSave() {
    setStatus("saving");
    startTransition(async () => {
      try {
        await saveTestimonials(items);
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    });
  }

  return (
    <div className="space-y-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="rounded-xl border border-slate-200 bg-white p-4"
        >
          {/* card header */}
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-500">
              #{index + 1}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveUp(index)}
                disabled={index === 0}
                className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                aria-label="위로 이동"
              >
                &#9650;
              </button>
              <button
                type="button"
                onClick={() => moveDown(index)}
                disabled={index === items.length - 1}
                className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                aria-label="아래로 이동"
              >
                &#9660;
              </button>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="ml-2 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:text-red-800"
              >
                삭제
              </button>
            </div>
          </div>

          {/* fields */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                작성자
              </label>
              <input
                type="text"
                value={item.author}
                onChange={(e) => update(index, "author", e.target.value)}
                placeholder="이o훈 님"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                지역
              </label>
              <input
                type="text"
                value={item.region}
                onChange={(e) => update(index, "region", e.target.value)}
                placeholder="서울 강남구"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                카테고리
              </label>
              <select
                value={item.category}
                onChange={(e) => update(index, "category", e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                제목 (짧은 키워드)
              </label>
              <input
                type="text"
                value={item.ko}
                onChange={(e) => update(index, "ko", e.target.value)}
                placeholder="변기 누수"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              후기 본문
            </label>
            <textarea
              value={item.body}
              onChange={(e) => update(index, "body", e.target.value)}
              rows={4}
              placeholder="고객 후기 전문을 입력하세요"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
      ))}

      {/* action buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={addItem}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          후기 추가
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isPending ? "저장 중..." : "저장"}
        </button>
        {status === "saved" && (
          <span className="text-sm font-semibold text-emerald-600">
            저장되었습니다
          </span>
        )}
        {status === "error" && (
          <span className="text-sm font-semibold text-red-600">
            저장에 실패했습니다
          </span>
        )}
      </div>
    </div>
  );
}
