"use client";

import Image from "next/image";
import { useEffect, useState, useRef, useCallback } from "react";
import { ChevronRight, ChevronUp } from "@/components/icons";

type Slide = {
  src: string;
  alt: string;
  headline: string;
  sub: string;
};

type Props = {
  slides: Slide[];
  intervalMs?: number;
};

export function HeroCarouselClient({ slides, intervalMs = 2800 }: Props) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const trackRef = useRef<HTMLDivElement>(null);

  const totalSlides = slides.length;

  const goTo = useCallback(
    (next: number) => {
      setIsTransitioning(true);
      setIdx(next);
    },
    [],
  );

  function next() {
    goTo((idx + 1) % totalSlides);
  }
  function prev() {
    goTo((idx - 1 + totalSlides) % totalSlides);
  }

  useEffect(() => {
    if (paused || totalSlides <= 1) return;
    const t = setInterval(() => {
      goTo((idx + 1) % totalSlides);
    }, intervalMs);
    return () => clearInterval(t);
  }, [paused, totalSlides, intervalMs, idx, goTo]);

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-slate-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div className="relative aspect-[16/9] w-full sm:aspect-[12/5] lg:aspect-auto lg:h-full">
        <div
          ref={trackRef}
          className="flex h-full transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${idx * 100}%)` }}
        >
          {slides.map((s, i) => (
            <div key={s.src} className="relative h-full w-full flex-shrink-0">
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
                className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent"
              />

              {/* 슬라이드별 문구 */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 sm:justify-center sm:p-10 lg:p-14">
                <p className="text-xs font-bold uppercase tracking-widest text-cyan-300 drop-shadow sm:text-sm">
                  수도권 24시간 누수 출동
                </p>
                <h2 className="mt-2 whitespace-pre-line text-3xl font-black leading-tight tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] sm:text-4xl lg:text-5xl xl:text-6xl">
                  {s.headline}
                </h2>
                <p className="mt-3 text-sm font-semibold text-white/90 drop-shadow sm:text-base lg:text-lg">
                  {s.sub}
                </p>
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
    </div>
  );
}
