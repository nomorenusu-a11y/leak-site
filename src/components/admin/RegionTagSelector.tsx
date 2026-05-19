"use client";

import { useState } from "react";
import { ALL_CITY_CODES, CITY_REGION_TAGS } from "@/lib/city";

const ALL_TAGS = ALL_CITY_CODES.map((code) => CITY_REGION_TAGS[code]);

export function RegionTagSelector({
  name,
  initial,
}: {
  name: string;
  initial: string[];
}) {
  const [selected, setSelected] = useState<string[]>(initial);

  function toggle(tag: string) {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold text-slate-800">
        지역 태그
        <span className="ml-2 text-xs font-normal text-slate-500">(여러 개 선택 가능)</span>
      </label>
      {/* hidden inputs로 form에 다중 값 전송 */}
      {selected.map((tag) => (
        <input key={tag} type="hidden" name={name} value={tag} />
      ))}
      <div className="flex flex-wrap gap-1.5">
        {ALL_TAGS.map((tag) => {
          const on = selected.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              aria-pressed={on}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                on
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
