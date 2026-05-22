"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { X } from "@/components/icons";

type Cat = "leak" | "toilet" | "sink" | "heating" | "frozen";

export type GalleryItem = {
  url: string;
  category: Cat;
  title: string;
  slug: string;
};

type Props = {
  categories: { code: Cat; ko: string }[];
  itemsByCategory: Record<Cat, GalleryItem[]>;
  allItems: GalleryItem[];
};

const ALL_TAB = "__all" as const;
type Tab = typeof ALL_TAB | Cat;

export function WorksGalleryClient({ categories, itemsByCategory, allItems }: Props) {
  const [tab, setTab] = useState<Tab>(ALL_TAB);
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);

  const items = tab === ALL_TAB ? allItems : itemsByCategory[tab];

  // ESC로 라이트박스 닫기
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  return (
    <div>
      {/* 탭 */}
      <div className="-mx-4 mb-6 overflow-x-auto px-4">
        <div role="tablist" aria-label="작업사례 카테고리" className="inline-flex gap-2">
          <TabBtn active={tab === ALL_TAB} onClick={() => setTab(ALL_TAB)}>
            전체
          </TabBtn>
          {categories.map((c) => (
            <TabBtn key={c.code} active={tab === c.code} onClick={() => setTab(c.code)}>
              {c.ko}
            </TabBtn>
          ))}
        </div>
      </div>

      {/* 그리드 */}
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {items.map((it, idx) => (
          <li key={`${it.url}-${idx}`}>
            <button
              type="button"
              onClick={() => setLightbox(it)}
              aria-label={`${it.title} 확대 보기`}
              className="group relative block aspect-square w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
            >
              <Image
                src={it.url}
                alt={it.title}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          </li>
        ))}
      </ul>

      {/* 라이트박스 */}
      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${lightbox.title} 확대`}
          onClick={() => setLightbox(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
        >
          <button
            type="button"
            aria-label="닫기"
            onClick={() => setLightbox(null)}
            className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
          >
            <X aria-hidden className="size-5" strokeWidth={2.25} />
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-3xl"
          >
            <div className="relative aspect-[4/3] w-full">
              <Image
                src={lightbox.url}
                alt={lightbox.title}
                fill
                sizes="(min-width: 768px) 768px, 100vw"
                className="rounded-2xl object-contain"
                priority
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 text-white">
              <p className="truncate text-sm font-semibold">{lightbox.title}</p>
              {lightbox.slug && (
                <Link
                  href={`/posts/${lightbox.slug}`}
                  className="shrink-0 rounded-md bg-white/15 px-3 py-1.5 text-sm font-bold text-white hover:bg-white/25"
                >
                  사례 보기 →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      type="button"
      className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm font-bold transition-colors ${
        active
          ? "border-brand-600 bg-brand-600 text-white"
          : "border-slate-300 bg-white text-slate-700 hover:border-brand-300 hover:text-brand-700"
      }`}
    >
      {children}
    </button>
  );
}
