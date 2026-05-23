"use client";

import { useState } from "react";
import { ChevronDown } from "@/components/icons";

type FaqItem = { question: string; answer: string };

type Props = { items: FaqItem[] };

/**
 * 메인페이지용 아코디언 — 한 항목만 열림(single open).
 *
 * 별도 라이브러리 없이 button + aria-expanded + 조건부 패널.
 */
export function FaqAccordion({ items }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <ul className="space-y-2">
      {items.map((it, i) => {
        const open = openIdx === i;
        return (
          <li
            key={it.question}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            <button
              type="button"
              aria-expanded={open}
              onClick={() => setOpenIdx(open ? null : i)}
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-slate-50 sm:px-6 sm:py-5"
            >
              <span className="flex items-baseline gap-2">
                <span className="text-base font-black text-brand-600 sm:text-lg">
                  Q{i + 1}
                </span>
                <span className="text-base font-bold text-slate-900 sm:text-lg">
                  {it.question}
                </span>
              </span>
              <ChevronDown
                aria-hidden
                className={`size-5 shrink-0 text-slate-500 transition-transform ${
                  open ? "rotate-180" : ""
                }`}
                strokeWidth={2.25}
              />
            </button>
            {open && (
              <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 text-sm leading-relaxed text-slate-700 sm:px-6 sm:py-5 sm:text-base">
                <p className="flex items-start gap-2">
                  <span className="text-base font-black text-brand-400 sm:text-lg">
                    A.
                  </span>
                  <span>{it.answer}</span>
                </p>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
