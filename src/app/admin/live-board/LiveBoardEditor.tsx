"use client";

import { useState, useTransition } from "react";
import { saveDemoBoard } from "./actions";
import type { DemoRequestData } from "@/types/database";

const CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: "leak", label: "누수탐지" },
  { value: "toilet", label: "변기" },
  { value: "sink", label: "싱크대" },
  { value: "heating", label: "난방" },
  { value: "frozen", label: "동파" },
];

const METRO_OPTIONS = ["서울", "경기", "인천"] as const;

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORY_OPTIONS.map((c) => [c.value, c.label]),
);

function nextId(items: DemoRequestData[]): string {
  let max = 0;
  for (const item of items) {
    const m = item.id.match(/^d(\d+)$/);
    if (m) {
      const n = parseInt(m[1], 10);
      if (n > max) max = n;
    }
  }
  return `d${String(max + 1).padStart(3, "0")}`;
}

export default function LiveBoardEditor({
  items: initialItems,
}: {
  items: DemoRequestData[];
}) {
  const [items, setItems] = useState<DemoRequestData[]>(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved">("idle");

  /* --- stats --- */
  const total = items.length;
  const metroCount = (m: string) => items.filter((i) => i.metro === m).length;

  /* --- handlers --- */
  function updateField(
    id: string,
    field: keyof DemoRequestData,
    value: string,
  ) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  }

  function deleteItem(id: string) {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) setEditingId(null);
  }

  function addItem() {
    const newItem: DemoRequestData = {
      id: nextId(items),
      masked_name: "",
      region: "",
      metro: "서울",
      category: "leak",
      symptom: "",
    };
    setItems((prev) => [...prev, newItem]);
    setEditingId(newItem.id);
  }

  function handleSave() {
    setSaveStatus("idle");
    startTransition(async () => {
      await saveDemoBoard(items);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    });
  }

  return (
    <div className="mt-6">
      {/* Stats */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        <StatCard label="전체" count={total} />
        {METRO_OPTIONS.map((m) => (
          <StatCard key={m} label={m} count={metroCount(m)} />
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">이름</th>
              <th className="px-3 py-2">지역</th>
              <th className="px-3 py-2">광역</th>
              <th className="px-3 py-2">카테고리</th>
              <th className="px-3 py-2">증상</th>
              <th className="px-3 py-2 text-right">액션</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-10 text-center text-sm text-slate-500"
                >
                  항목이 없습니다. 아래 버튼으로 추가하세요.
                </td>
              </tr>
            ) : (
              items.map((item) =>
                editingId === item.id ? (
                  <EditRow
                    key={item.id}
                    item={item}
                    onUpdate={updateField}
                    onDone={() => setEditingId(null)}
                    onDelete={() => deleteItem(item.id)}
                  />
                ) : (
                  <ViewRow
                    key={item.id}
                    item={item}
                    onClick={() => setEditingId(item.id)}
                    onDelete={() => deleteItem(item.id)}
                  />
                ),
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={addItem}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          + 항목 추가
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {isPending ? "저장 중..." : "저장"}
        </button>
        {saveStatus === "saved" && (
          <span className="text-sm font-medium text-emerald-600">
            저장 완료
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                      */
/* ------------------------------------------------------------------ */

function StatCard({ label, count }: { label: string; count: number }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{count}</p>
    </div>
  );
}

function ViewRow({
  item,
  onClick,
  onDelete,
}: {
  item: DemoRequestData;
  onClick: () => void;
  onDelete: () => void;
}) {
  return (
    <tr
      className="cursor-pointer hover:bg-slate-50"
      onClick={onClick}
    >
      <td className="px-3 py-2 text-sm font-mono text-slate-500">
        {item.id}
      </td>
      <td className="px-3 py-2 text-sm text-slate-900">{item.masked_name}</td>
      <td className="px-3 py-2 text-sm text-slate-700">{item.region}</td>
      <td className="px-3 py-2 text-sm text-slate-700">{item.metro}</td>
      <td className="px-3 py-2 text-sm text-slate-700">
        {CATEGORY_LABEL[item.category] ?? item.category}
      </td>
      <td className="px-3 py-2 text-sm text-slate-700">{item.symptom}</td>
      <td className="px-3 py-2 text-right">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
        >
          삭제
        </button>
      </td>
    </tr>
  );
}

function EditRow({
  item,
  onUpdate,
  onDone,
  onDelete,
}: {
  item: DemoRequestData;
  onUpdate: (id: string, field: keyof DemoRequestData, value: string) => void;
  onDone: () => void;
  onDelete: () => void;
}) {
  const inputCls =
    "w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";
  const selectCls =
    "w-full rounded border border-slate-300 px-2 py-1 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

  return (
    <tr className="bg-brand-50/30">
      <td className="px-3 py-2 text-sm font-mono text-slate-500">
        {item.id}
      </td>
      <td className="px-3 py-2">
        <input
          className={inputCls}
          value={item.masked_name}
          onChange={(e) => onUpdate(item.id, "masked_name", e.target.value)}
          placeholder="김o수"
        />
      </td>
      <td className="px-3 py-2">
        <input
          className={inputCls}
          value={item.region}
          onChange={(e) => onUpdate(item.id, "region", e.target.value)}
          placeholder="서울 강남구"
        />
      </td>
      <td className="px-3 py-2">
        <select
          className={selectCls}
          value={item.metro}
          onChange={(e) => onUpdate(item.id, "metro", e.target.value)}
        >
          {METRO_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2">
        <select
          className={selectCls}
          value={item.category}
          onChange={(e) => onUpdate(item.id, "category", e.target.value)}
        >
          {CATEGORY_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2">
        <input
          className={inputCls}
          value={item.symptom}
          onChange={(e) => onUpdate(item.id, "symptom", e.target.value)}
          placeholder="천장 누수"
        />
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={onDone}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            완료
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
          >
            삭제
          </button>
        </div>
      </td>
    </tr>
  );
}
