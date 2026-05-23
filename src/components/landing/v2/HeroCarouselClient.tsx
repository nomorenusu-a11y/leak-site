"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { ChevronRight, ChevronUp } from "@/components/icons";

type Slide = {
  src: string;
  alt: string;
  tag: string;
  headline: string;
  sub: string;
  hashtags: string[];
};

type Props = {
  slides: Slide[];
  intervalMs?: number;
};

export function HeroCarouselClient({ slides, intervalMs = 2800 }: Props) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;

  const goTo = useCallback((n: number) => setIdx(n), []);

  function next() {
    goTo((idx + 1) % total);
  }
  function prev() {
    goTo((idx - 1 + total) % total);
  }

  useEffect(() => {
    if (paused || total <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % total), intervalMs);
    return () => clearInterval(t);
  }, [paused, total, intervalMs]);

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-slate-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      {/* Track */}
      <div
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${idx * 100}%)` }}
      >
        {slides.map((s, i) => (
          <div key={s.src} className="relative h-full w-full shrink-0">
            <Image
              src={s.src}
              alt={s.alt}
              fill
              priority={i === 0}
              sizes="(min-width: 1024px) 60vw, 100vw"
              className="object-cover"
            />
            {/* 어두운 오버레이 */}
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/25"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent"
            />

            {/* 슬라이드별 문구 */}
            <div className="absolute inset-0 flex flex-col justify-end p-6 pb-16 sm:justify-center sm:p-10 lg:p-14">
              <span className="inline-flex w-fit rounded-full bg-white/20 px-5 py-2 text-sm font-extrabold text-white backdrop-blur-sm sm:px-6 sm:py-2.5 sm:text-base">
                {s.tag}
              </span>
              <h2 className="mt-3 whitespace-pre-line text-4xl font-black leading-[1.1] tracking-tight text-white drop-shadow-[0_3px_10px_rgba(0,0,0,0.7)] sm:text-5xl lg:text-6xl xl:text-7xl">
                {s.headline}
              </h2>
              <p className="mt-3 max-w-xl text-base font-semibold text-white/90 drop-shadow sm:text-lg lg:text-xl">
                {s.sub}
              </p>
              <div className="mt-4 flex flex-wrap gap-2 sm:gap-2.5">
                {s.hashtags.map((h) => (
                  <span
                    key={h}
                    className="rounded-full border border-white/25 bg-white/10 px-3.5 py-1.5 text-xs font-bold text-white/90 backdrop-blur-sm sm:px-5 sm:py-2 sm:text-sm lg:text-base"
                  >
                    #{h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 좌·우 화살표 */}
      <button
        type="button"
        aria-label="이전 이미지"
        onClick={prev}
        className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/45 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/65 sm:block"
      >
        <ChevronUp
          aria-hidden
          className="size-6 -rotate-90"
          strokeWidth={2.5}
        />
      </button>
      <button
        type="button"
        aria-label="다음 이미지"
        onClick={next}
        className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/45 p-2.5 text-white backdrop-blur-sm transition hover:bg-black/65 sm:block"
      >
        <ChevronRight aria-hidden className="size-6" strokeWidth={2.5} />
      </button>

      {/* 페이지네이션 점 */}
      <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`${i + 1}번 이미지로`}
            className={`h-2 rounded-full transition-all ${
              i === idx
                ? "w-8 bg-white"
                : "w-2 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
