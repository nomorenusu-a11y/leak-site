"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ChevronRight, ChevronUp } from "@/components/icons";

type Slide = {
  src: string;
  alt: string;
};

type Props = {
  slides: Slide[];
  /** 자동 슬라이드 간격 ms (기본 3.5s) */
  intervalMs?: number;
};

/**
 * Hero 가로 캐러셀 — 꽉차는 풀블리드 + 크로스페이드 자동 슬라이드.
 *
 * - 라운드 코너·shadow 제거 → 좌측 column을 끝까지 채움
 * - 5장 와이드 이미지가 일정 간격으로 자동 전환 (opacity 600ms 페이드)
 * - 좌·우 화살표 (sm+) + 하단 페이지네이션 점
 * - 마우스 hover 시 일시 정지
 */
export function HeroCarouselClient({ slides, intervalMs = 3500 }: Props) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || slides.length <= 1) return;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [paused, slides.length, intervalMs]);

  function next() {
    setIdx((i) => (i + 1) % slides.length);
  }
  function prev() {
    setIdx((i) => (i - 1 + slides.length) % slides.length);
  }

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-slate-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
    >
      <div className="relative aspect-[15/7] w-full lg:aspect-auto lg:h-full">
        {slides.map((s, i) => (
          <div
            key={s.src}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === idx ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={i !== idx}
          >
            <Image
              src={s.src}
              alt={s.alt}
              fill
              priority={i === 0}
              sizes="(min-width: 1024px) 80vw, 100vw"
              className="object-cover"
            />
          </div>
        ))}

        {/* 좌·우 화살표 */}
        <button
          type="button"
          aria-label="이전 이미지"
          onClick={prev}
          className="absolute left-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/45 p-2 text-white backdrop-blur-sm transition hover:bg-black/65 sm:block"
        >
          <ChevronUp aria-hidden className="size-5 -rotate-90" strokeWidth={2.5} />
        </button>
        <button
          type="button"
          aria-label="다음 이미지"
          onClick={next}
          className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-full bg-black/45 p-2 text-white backdrop-blur-sm transition hover:bg-black/65 sm:block"
        >
          <ChevronRight aria-hidden className="size-5" strokeWidth={2.5} />
        </button>

        {/* 페이지네이션 점 */}
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              aria-label={`${i + 1}번 이미지로`}
              className={`h-1.5 rounded-full transition-all ${
                i === idx ? "w-7 bg-white" : "w-1.5 bg-white/55 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
