"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Star, ChevronRight, ChevronUp } from "@/components/icons";

export type CarouselItem = {
  author: string;
  region: string;
  category: string;
  ko: string;
  body: string;
  photo?: string | null;
};

type Props = {
  items: CarouselItem[];
};

const AUTOPLAY_MS = 5000;

/**
 * 후기 가로 카루셀 — native scroll-snap + autoplay.
 *
 * - scroll-snap-x로 카드 단위 정렬
 * - autoplay: 5s마다 한 칸 이동 (사용자가 직접 스크롤하면 일시 정지)
 * - 좌·우 화살표 버튼으로 수동 이동
 * - 모바일에서는 한 카드, sm+에서는 2 카드 가시
 */
export function TestimonialsCarouselClient({ items }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  function scrollTo(idx: number) {
    const track = trackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll<HTMLElement>("[data-card]");
    const target = cards[idx];
    if (!target) return;
    track.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
    setIndex(idx);
  }

  function next() {
    scrollTo((index + 1) % items.length);
  }

  function prev() {
    scrollTo((index - 1 + items.length) % items.length);
  }

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => {
      setIndex((i) => {
        const newIdx = (i + 1) % items.length;
        const track = trackRef.current;
        if (track) {
          const cards = track.querySelectorAll<HTMLElement>("[data-card]");
          const target = cards[newIdx];
          if (target) {
            track.scrollTo({ left: target.offsetLeft, behavior: "smooth" });
          }
        }
        return newIdx;
      });
    }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [paused, items.length]);

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div
        ref={trackRef}
        className="hide-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-4 sm:gap-5"
      >
        {items.map((t, i) => (
          <article
            key={i}
            data-card
            className="snap-start shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm w-[88%] sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.833rem)]"
          >
            {t.photo && (
              <div className="relative aspect-[16/9] bg-slate-100">
                <Image
                  src={t.photo}
                  alt={`${t.ko} 시공 사진`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
                <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-white/95 px-3 py-1 text-xs font-extrabold text-brand-700 shadow-sm">
                  {t.ko}
                </span>
              </div>
            )}
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star
                    key={k}
                    aria-hidden
                    className="size-4 fill-amber-400 text-amber-400"
                    strokeWidth={1.5}
                  />
                ))}
                <span className="sr-only">별점 5점</span>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-700">
                {t.body}
              </p>
              <div className="mt-4 flex items-center gap-2 text-sm">
                <span className="font-bold text-slate-900">{t.author}</span>
                <span aria-hidden className="text-slate-300">
                  ·
                </span>
                <span className="text-slate-500">{t.region}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* 화살표 */}
      <button
        type="button"
        onClick={prev}
        aria-label="이전 후기"
        className="absolute left-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white p-2 shadow-md ring-1 ring-slate-200 hover:bg-slate-50 sm:block"
      >
        <ChevronUp
          aria-hidden
          className="size-5 -rotate-90 text-slate-700"
          strokeWidth={2.5}
        />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="다음 후기"
        className="absolute right-2 top-1/2 hidden -translate-y-1/2 rounded-full bg-white p-2 shadow-md ring-1 ring-slate-200 hover:bg-slate-50 sm:block"
      >
        <ChevronRight
          aria-hidden
          className="size-5 text-slate-700"
          strokeWidth={2.5}
        />
      </button>

      {/* 인디케이터 */}
      <div className="mt-2 flex items-center justify-center gap-1.5">
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => scrollTo(i)}
            aria-label={`${i + 1}번 후기로`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-brand-600" : "w-1.5 bg-slate-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
