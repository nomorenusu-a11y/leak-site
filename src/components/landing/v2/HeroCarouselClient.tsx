"use client";

import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { ChevronRight, ChevronUp } from "@/components/icons";

type Slide = {
  src: string;
  alt: string;
  tag: string;
  tagColor: string;
  line1: string;
  line2: string;
  line2Color: string;
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
      onTouchEnd={() => setPaused(false)}
    >
      {/* Track */}
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
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
              className="object-cover object-top sm:object-center"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/20"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent"
            />

            {/* 슬라이드별 문구 */}
            <div className="absolute inset-0 flex flex-col justify-end px-5 pb-12 sm:justify-center sm:px-10 lg:px-14">
              <span
                className={`inline-flex w-fit rounded-full px-4 py-1.5 text-xs font-extrabold backdrop-blur-sm sm:px-6 sm:py-2 sm:text-base lg:text-lg ${s.tagColor}`}
              >
                {s.tag}
              </span>
              <h2 className="mt-2 text-[2rem] font-black leading-[1.1] tracking-tight drop-shadow-[0_3px_10px_rgba(0,0,0,0.7)] sm:mt-3 sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl">
                <span className="text-white">{s.line1}</span>
                <br />
                <span className={s.line2Color}>{s.line2}</span>
              </h2>
              <p className="mt-2 max-w-xl text-sm font-semibold text-white/90 drop-shadow sm:mt-3 sm:text-lg lg:text-xl">
                {s.sub}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2.5">
                {s.hashtags.map((h) => (
                  <span
                    key={h}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold text-white/85 backdrop-blur-sm sm:px-5 sm:py-2 sm:text-sm lg:text-base"
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
      <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2 sm:bottom-4">
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
